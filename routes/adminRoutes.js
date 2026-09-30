const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Service = require("../models/service");
const Booking = require("../models/booking");
const Company = require("../models/company");

const isAdmin = require("../middleware/admin");
const isLoggedIn = require("../middleware/isLoggedIn");
const Review = require("../models/review");
const Settings = require("../models/settings");

const {
  validateObjectId,
  validateSlug,
  validatePlatformName,
  validateEmail,
  validateSupportPhone,
  validatePlatformAddress,
  validateDefaultBookingStatus,
  validateCancellationLimitValue,
  validateCancellationLimitUnit,
  validateBookingStatus,
} = require("../utils/validators");

// =====================================
// ADMIN DASHBOARD
// =====================================

router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    // =====================================
    // SEARCH + DATE RANGE
    // =====================================

    const search = req.query.search?.trim() || "";
    const startDate = req.query.startDate?.trim() || "";
    const endDate = req.query.endDate?.trim() || "";

    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      req.flash("error", "Invalid start date.");
      return res.redirect("/admin/dashboard");
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      req.flash("error", "Invalid end date.");
      return res.redirect("/admin/dashboard");
    }

    const isSearchActive =
      search.length > 0 || startDate.length > 0 || endDate.length > 0;

    // =====================================
    // COUNTS
    // =====================================

    const totalUsers = await User.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalProfessionals = await User.countDocuments({
      role: "professional",
    });

    const totalServices = await Service.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });

    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    // =====================================
    // RECENT USERS
    // =====================================

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    // =====================================
    // TODAY DATE RANGE - IST
    // =====================================

    const now = new Date();

    const istString = now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    const istNow = new Date(istString);

    const startOfTodayIST = new Date(istNow);
    startOfTodayIST.setHours(0, 0, 0, 0);

    const endOfTodayIST = new Date(istNow);
    endOfTodayIST.setHours(23, 59, 59, 999);

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    const startOfTodayUTC = new Date(startOfTodayIST.getTime() - IST_OFFSET);

    const endOfTodayUTC = new Date(endOfTodayIST.getTime() - IST_OFFSET);

    // =====================================
    // NEW BOOKINGS
    // =====================================

    const newBookingsCount = await Booking.countDocuments({
      adminSeen: { $ne: true },
    });

    // =====================================
    // TODAY'S BOOKINGS
    // =====================================

    const todaysBookingsCount = await Booking.countDocuments({
      bookingDate: {
        $gte: startOfTodayUTC,
        $lte: endOfTodayUTC,
      },
    });

    // =====================================
    // UPCOMING BOOKINGS
    // =====================================

    const upcomingBookings = await Booking.find({
      bookingDate: {
        $gt: new Date(),
      },
    })
      .populate("customer", "name email")
      .populate("professional", "name email")
      .populate("service", "name")
      .populate("company", "name")
      .sort({ bookingDate: 1 })
      .limit(10);

    // =====================================
    // FUTURE BOOKINGS COUNT
    // =====================================

    const upcomingBookingsCount = await Booking.countDocuments({
      bookingDate: {
        $gt: endOfTodayUTC,
      },
    });

    // =====================================
    // BUILD BOOKING QUERY
    // =====================================

    const filters = [];

    // =====================================
    // TEXT SEARCH
    // =====================================

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      const [customers, professionals, services, companies, directBookings] =
        await Promise.all([
          User.find({
            role: "customer",
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { mobile: searchRegex },
            ],
          }).select("_id"),

          User.find({
            role: "professional",
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { mobile: searchRegex },
            ],
          }).select("_id"),

          Service.find({
            $or: [
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
            ],
          }).select("_id"),

          Company.find({
            $or: [
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
              { city: searchRegex },
            ],
          }).select("_id"),

          Booking.find({
            $or: [{ message: searchRegex }, { status: searchRegex }],
          }).select("_id"),
        ]);

      filters.push({
        $or: [
          {
            customer: {
              $in: customers.map((user) => user._id),
            },
          },
          {
            professional: {
              $in: professionals.map((user) => user._id),
            },
          },
          {
            service: {
              $in: services.map((service) => service._id),
            },
          },
          {
            company: {
              $in: companies.map((company) => company._id),
            },
          },
          {
            _id: {
              $in: directBookings.map((booking) => booking._id),
            },
          },
        ],
      });
    }

    // =====================================
    // DATE RANGE SEARCH
    // =====================================

    if (startDate || endDate) {
      const dateFilter = {};

      // FROM DATE
      if (startDate) {
        const [year, month, day] = startDate.split("-").map(Number);

        const startOfDayUTC = new Date(
          Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET,
        );

        dateFilter.$gte = startOfDayUTC;
      }

      // TO DATE
      if (endDate) {
        const [year, month, day] = endDate.split("-").map(Number);

        const endOfDayUTC = new Date(
          Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - IST_OFFSET,
        );

        dateFilter.$lt = endOfDayUTC;
      }

      // Prevent invalid date range
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        req.flash("error", "End date cannot be before start date.");

        return res.redirect("/admin/dashboard");
      }

      filters.push({
        bookingDate: dateFilter,
      });
    }

    // =====================================
    // FINAL BOOKING QUERY
    // =====================================

    let bookingQuery = {};

    if (filters.length > 0) {
      bookingQuery = {
        $and: filters,
      };
    }

    // =====================================
    // DASHBOARD BOOKINGS
    // =====================================

    const dashboardBookings = await Booking.find(bookingQuery)
      .populate("customer", "name email mobile")
      .populate("professional", "name email mobile")
      .populate("service", "name price category")
      .populate("company", "name category city")
      .sort({
        bookingDate: 1,
      })
      .limit(20);

    const professionalCount = await User.countDocuments({
      role: "professional",
    });

    const customerCount = await User.countDocuments({
      role: "customer",
    });

    const serviceCount = await Service.countDocuments();

    // =====================================
    // RENDER
    // =====================================

    res.render("admin/dashboard", {
      pageTitle: "Dashboard",
      activePage: "dashboard",

      totalUsers,
      totalCustomers,
      totalProfessionals,
      totalServices,

      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,

      recentUsers,

      newBookingsCount,
      todaysBookingsCount,
      upcomingBookingsCount,

      dashboardBookings,

      search,
      startDate,
      endDate,

      isSearchActive,

      upcomingBookings,

      professionalCount,
      customerCount,
      serviceCount,
    });
  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);

    req.flash("error", "Unable to load admin dashboard.");

    res.redirect("/");
  }
});

// =====================================
// ADMIN - ALL BOOKINGS + SEARCH + DATE
// =====================================

// =====================================
// ADMIN - ALL BOOKINGS + SEARCH
// =====================================

router.get("/bookings", isAdmin, isLoggedIn, async (req, res) => {
  try {
    // =====================================
    // SEARCH VALUES
    // =====================================

    const search = req.query.search?.trim() || "";

    const startDate = req.query.startDate?.trim() || "";

    const endDate = req.query.endDate?.trim() || "";

    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      req.flash("error", "Invalid start date.");
      return res.redirect("/admin/bookings");
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      req.flash("error", "Invalid end date.");
      return res.redirect("/admin/bookings");
    }

    // =====================================
    // FILTERS
    // =====================================

    const filters = [];

    // =====================================
    // TEXT SEARCH
    // =====================================

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      const [customers, professionals, services, companies, matchingBookings] =
        await Promise.all([
          // CUSTOMERS

          User.find({
            role: "customer",

            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { mobile: searchRegex },
            ],
          }).select("_id"),

          // PROFESSIONALS

          User.find({
            role: "professional",

            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { mobile: searchRegex },
            ],
          }).select("_id"),

          // SERVICES

          Service.find({
            $or: [
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
            ],
          }).select("_id"),

          // COMPANIES

          Company.find({
            $or: [
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
              { city: searchRegex },
            ],
          }).select("_id"),

          // BOOKING MESSAGE + STATUS

          Booking.find({
            $or: [{ message: searchRegex }, { status: searchRegex }],
          }).select("_id"),
        ]);

      // ADD TEXT FILTER

      filters.push({
        $or: [
          {
            customer: {
              $in: customers.map((user) => user._id),
            },
          },

          {
            professional: {
              $in: professionals.map((user) => user._id),
            },
          },

          {
            service: {
              $in: services.map((service) => service._id),
            },
          },

          {
            company: {
              $in: companies.map((company) => company._id),
            },
          },

          {
            _id: {
              $in: matchingBookings.map((booking) => booking._id),
            },
          },
        ],
      });
    }

    // =====================================
    // DATE RANGE SEARCH
    // =====================================

    if (startDate || endDate) {
      const dateFilter = {};

      // IST OFFSET

      const IST_OFFSET = 5.5 * 60 * 60 * 1000;

      // =====================================
      // FROM DATE
      // =====================================

      if (startDate) {
        const [year, month, day] = startDate.split("-").map(Number);

        if (!year || !month || !day) {
          req.error("Invalid start date.");

          return res.redirect("/admin/bookings");
        }

        const startOfDayUTC = new Date(
          Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET,
        );

        dateFilter.$gte = startOfDayUTC;
      }

      // =====================================
      // TO DATE
      // =====================================

      if (endDate) {
        const [year, month, day] = endDate.split("-").map(Number);

        if (!year || !month || !day) {
          req.error("Invalid end date.");

          return res.redirect("/admin/bookings");
        }

        // NEXT DAY
        // Includes the complete end date

        const nextDayUTC = new Date(
          Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - IST_OFFSET,
        );

        dateFilter.$lt = nextDayUTC;
      }

      // =====================================
      // VALIDATE DATE RANGE
      // =====================================

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        req.error("End date cannot be before start date.");

        return res.redirect("/admin/bookings");
      }

      // ADD DATE FILTER

      filters.push({
        bookingDate: dateFilter,
      });
    }

    // =====================================
    // FINAL MONGODB QUERY
    // =====================================

    let bookingQuery = {};

    if (filters.length > 0) {
      bookingQuery = {
        $and: filters,
      };
    }

    // =====================================
    // GET BOOKINGS
    // =====================================

    const bookings = await Booking.find(bookingQuery)

      .populate("customer", "name email mobile")

      .populate("professional", "name email mobile")

      .populate("service", "name price duration category")

      .populate("company", "name category city")

      .sort({
        bookingDate: -1,
      });

    // =====================================
    // RENDER PAGE
    // =====================================

    res.render("admin/bookings", {
      pageTitle: "Bookings",

      activePage: "bookings",

      bookings,

      search,

      startDate,

      endDate,
    });
  } catch (error) {
    console.log("ADMIN BOOKINGS SEARCH ERROR:", error);

    req.error("Unable to load bookings.");

    res.redirect("/admin/dashboard");
  }
});

// =====================================
// ADMIN - BOOKING DETAILS
// =====================================

router.get("/bookings/:id", isAdmin, async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      req.flash("error", "Invalid booking ID.");
      return res.redirect("/admin/bookings");
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        adminSeen: true,
      },
      {
        new: true,
      },
    )
      .populate("customer", "name email mobile address")
      .populate("professional", "name email mobile consultancy experience")
      .populate("service", "name category description price duration")
      .populate(
        "company",
        "name description category email mobile address city website",
      );

    // Booking not found
    if (!booking) {
      req.error("Booking not found.");

      return res.redirect("/admin/bookings");
    }

    res.render("admin/bookingDetails", {
      pageTitle: "Booking Details",
      activePage: "bookings",
      booking,
    });
  } catch (error) {
    console.log("ADMIN BOOKING DETAILS ERROR:", error);

    req.error("Unable to load booking details.");

    res.redirect("/admin/bookings");
  }
});

// ==========================================
// ADMIN CUSTOMERS
// ==========================================

router.get("/customers", isAdmin, async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    }).sort({
      createdAt: -1,
    });

    const customerData = await Promise.all(
      customers.map(async (customer) => {
        const bookings = await Booking.find({
          customer: customer._id,
        })
          .populate("service")
          .populate("company");

        return {
          customer,
          bookings,
        };
      }),
    );

    res.render("admin/customers", {
      customers: customerData,
    });
  } catch (error) {
    console.log("ADMIN CUSTOMERS ERROR:", error);

    req.error("Unable to load customers.");
    res.redirect("/admin/dashboard");
  }
});

// ==========================================
// ADMIN CUSTOMER DETAILS
// ==========================================

router.get("/customers/:customerId", isAdmin, async (req, res) => {
  try {
    if (!validateObjectId(req.params.customerId)) {
      req.flash("error", "Invalid customer ID.");
      return res.redirect("/admin/customers");
    }

    const customer = await User.findOne({
      _id: req.params.customerId,
      role: "customer",
    });

    if (!customer) {
      req.error("Customer not found.");
      return res.redirect("/admin/customers");
    }

    const bookings = await Booking.find({
      customer: customer._id,
    })
      .populate("service")
      .populate("professional")
      .populate("company")
      .sort({
        createdAt: -1,
      });

    res.render("admin/customerDetails", {
      customer,
      bookings,
      pageTitle: `${customer.name} | Customer Details`,
    });
  } catch (error) {
    console.log("CUSTOMER DETAILS ERROR:", error);

    req.error("Unable to load customer details.");
    return res.redirect("/admin/customers");
  }
});

// ==========================================
// ALL PROFESSIONALS + SEARCH
// ==========================================

router.get("/professionals", isAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";

    let query = {
      role: "professional",
    };

    // Search functionality
    if (search.trim()) {
      const safeSearch = search.trim().slice(0, 100);

      const searchRegex = new RegExp(
        safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { consultancy: searchRegex },
        { specialization: searchRegex },
        { skills: searchRegex },
      ];
    }

    const professionals = await User.find(query).sort({
      createdAt: -1,
    });

    res.render("admin/professionals", {
      professionals,
      search,
      pageTitle: "Professionals | Nirnay Admin",
    });
  } catch (error) {
    console.log("ADMIN PROFESSIONAL SEARCH ERROR:", error);

    req.error("Unable to load professionals.");
    res.redirect("/admin/dashboard");
  }
});

// ==========================================
// PROFESSIONAL DETAILS
// ==========================================

router.get("/professionals/:professionalId", isAdmin, async (req, res) => {
  try {
    if (!validateObjectId(req.params.professionalId)) {
      req.flash("error", "Invalid professional ID.");
      return res.redirect("/admin/professionals");
    }

    // Find the professional

    const professional = await User.findOne({
      _id: req.params.professionalId,
      role: "professional",
    });

    // If professional does not exist

    if (!professional) {
      req.error("Professional not found.");
      return res.redirect("/admin/professionals");
    }

    // ==========================================
    // FIND PROFESSIONAL'S COMPANY
    // ==========================================

    const company = await Company.findOne({
      owner: professional._id,
    });

    // ==========================================
    // FIND PROFESSIONAL'S SERVICES
    // ==========================================

    const services = await Service.find({
      professional: professional._id,
    }).sort({
      createdAt: -1,
    });

    // ==========================================
    // FIND BOOKINGS RECEIVED BY PROFESSIONAL
    // ==========================================

    const bookings = await Booking.find({
      professional: professional._id,
    })
      .populate("customer")
      .populate("service")
      .sort({
        createdAt: -1,
      });

    // ==========================================
    // RENDER PROFESSIONAL DETAILS PAGE
    // ==========================================

    res.render("admin/professionalDetails", {
      professional,
      company,
      services,
      bookings,

      pageTitle: `${professional.name} | Professional Details | Nirnay Admin`,
    });
  } catch (error) {
    console.log("ADMIN PROFESSIONAL DETAILS ERROR:", error);

    req.error("Unable to load professional details.");

    return res.redirect("/admin/professionals");
  }
});

// =====================================
// ADMIN - ALL SERVICES
// =====================================

router.get("/services", isAdmin, async (req, res) => {
  try {
    const services = await Service.find()
      .populate("professional", "name email slug")
      .populate("company", "name category city")
      .sort({
        createdAt: -1,
      });

    res.render("admin/services", {
      pageTitle: "Services",
      activePage: "services",
      services,
    });
  } catch (error) {
    console.log("ADMIN SERVICES ERROR:", error);

    req.error("Unable to load services.");

    res.redirect("/admin/dashboard");
  }
});

// =====================================
// ADMIN - SERVICE DETAILS
// =====================================

router.get("/services/:slug", isAdmin, async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      req.flash("error", "Invalid service slug.");
      return res.redirect("/admin/services");
    }

    const service = await Service.findOne({
      slug: req.params.slug,
    })
      .populate("professional", "name email mobile consultancy experience slug")
      .populate(
        "company",
        "name description category email mobile address city website",
      );

    if (!service) {
      req.error("Service not found.");

      return res.redirect("/admin/services");
    }

    // =====================================
    // GET BOOKINGS FOR THIS SERVICE
    // =====================================

    const bookings = await Booking.find({
      service: service._id,
    })
      .populate("customer", "name email mobile")
      .populate("professional", "name email")
      .populate("company", "name")
      .sort({
        createdAt: -1,
      });

    res.render("admin/serviceDetails", {
      pageTitle: "Service Details",
      activePage: "services",
      service,
      bookings,
    });
  } catch (error) {
    console.log("ADMIN SERVICE DETAILS ERROR:", error);

    req.error("Unable to load service details.");

    res.redirect("/admin/services");
  }
});

// =====================================
// ADMIN - ALL REVIEWS
// =====================================

router.get("/reviews", isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("service", "name")
      .populate("professional", "name")
      .sort({ createdAt: -1 });

    res.render("admin/reviews", {
      pageTitle: "Reviews",
      activePage: "reviews",
      reviews,
    });
  } catch (error) {
    console.log("ADMIN REVIEWS ERROR:", error);

    req.error("Unable to load reviews.");

    res.redirect("/admin/dashboard");
  }
});

// =====================================
// ADMIN - SETTINGS
// =====================================

router.get("/settings", isAdmin, async (req, res) => {
  try {
    // Find existing settings
    let platformSettings = await Settings.findOne();

    // Create default settings if none exist
    if (!platformSettings) {
      platformSettings = await Settings.create({});
    }

    res.render("admin/settings", {
      pageTitle: "Settings",
      activePage: "settings",
      platformSettings,
    });
  } catch (error) {
    console.log("ADMIN SETTINGS ERROR:", error);

    req.error("Unable to load settings.");

    res.redirect("/admin/dashboard");
  }
});

// =====================================
// ADMIN - UPDATE SETTINGS
// =====================================

router.post("/settings", isAdmin, async (req, res) => {
  try {
    const {
      platformName,
      supportEmail,
      supportPhone,
      platformAddress,
      defaultBookingStatus,
      cancellationLimitValue,
      cancellationLimitUnit,
    } = req.body;

    const platformNameError = validatePlatformName(platformName);
    if (platformNameError) {
      req.flash("error", platformNameError);
      return res.redirect("/admin/settings");
    }

    if (supportEmail) {
      const emailError = validateEmail(supportEmail);
      if (emailError) {
        req.flash("error", emailError);
        return res.redirect("/admin/settings");
      }
    }

    const phoneError = validateSupportPhone(supportPhone);
    if (phoneError) {
      req.flash("error", phoneError);
      return res.redirect("/admin/settings");
    }

    const addressError = validatePlatformAddress(platformAddress);
    if (addressError) {
      req.flash("error", addressError);
      return res.redirect("/admin/settings");
    }

    const bookingStatusError =
      validateDefaultBookingStatus(defaultBookingStatus);

    if (bookingStatusError) {
      req.flash("error", bookingStatusError);
      return res.redirect("/admin/settings");
    }

    const cancellationValueError = validateCancellationLimitValue(
      cancellationLimitValue,
    );

    if (cancellationValueError) {
      req.flash("error", cancellationValueError);
      return res.redirect("/admin/settings");
    }

    const cancellationUnitError = validateCancellationLimitUnit(
      cancellationLimitUnit,
    );

    if (cancellationUnitError) {
      req.flash("error", cancellationUnitError);
      return res.redirect("/admin/settings");
    }

    // Checkboxes return "on" when checked
    const allowBookings = req.body.allowBookings === "on";

    const allowCustomerCancellation =
      req.body.allowCustomerCancellation === "on";

    const allowCustomerRegistration =
      req.body.allowCustomerRegistration === "on";

    const allowProfessionalRegistration =
      req.body.allowProfessionalRegistration === "on";

    const requireProfessionalApproval =
      req.body.requireProfessionalApproval === "on";

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // ==============================
    // PLATFORM SETTINGS
    // ==============================

    settings.platformName = platformName;
    settings.supportEmail = supportEmail;
    settings.supportPhone = supportPhone;
    settings.platformAddress = platformAddress;

    // ==============================
    // BOOKING SETTINGS
    // ==============================

    settings.allowBookings = allowBookings;
    settings.defaultBookingStatus = defaultBookingStatus;
    settings.allowCustomerCancellation = allowCustomerCancellation;

    settings.cancellationLimitValue = Number(cancellationLimitValue);
    settings.cancellationLimitUnit = cancellationLimitUnit;

    // ==============================
    // USER SETTINGS
    // ==============================

    settings.allowCustomerRegistration = allowCustomerRegistration;

    settings.allowProfessionalRegistration = allowProfessionalRegistration;

    settings.requireProfessionalApproval = requireProfessionalApproval;

    const parsedCancellationLimit = Number(cancellationLimitValue);

    if (
      !Number.isInteger(parsedCancellationLimit) ||
      parsedCancellationLimit < 1
    ) {
      req.error("Cancellation limit must be at least 1.");
      return res.redirect("/admin/settings");
    }

    if (!["hours", "days"].includes(cancellationLimitUnit)) {
      req.error("Invalid cancellation limit unit.");
      return res.redirect("/admin/settings");
    }

    await settings.save();

    req.success("Settings updated successfully!");

    res.redirect("/admin/settings");
  } catch (error) {
    console.log("UPDATE SETTINGS ERROR:", error);

    req.error("Unable to update settings.");

    res.redirect("/admin/settings");
  }
});

// =====================================
// ADMIN - UPDATE BOOKING STATUS
// =====================================

router.post("/bookings/:id/status", isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!validateObjectId(req.params.id)) {
      req.flash("error", "Invalid booking ID.");
      return res.redirect("/admin/bookings");
    }

    const statusError = validateBookingStatus(status);

    if (statusError) {
      req.flash("error", statusError);
      return res.redirect(`/admin/bookings/${req.params.id}`);
    }

    // Allowed booking statuses
    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      req.error("Invalid booking status.");

      return res.redirect(`/admin/bookings/${req.params.id}`);
    }

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.error("Booking not found.");

      return res.redirect("/admin/bookings");
    }

    // Prevent changing completed booking
    if (booking.status === "completed") {
      req.error("A completed booking cannot be changed.");

      return res.redirect(`/admin/bookings/${booking._id}`);
    }

    // Prevent changing cancelled booking
    if (booking.status === "cancelled") {
      req.error("A cancelled booking cannot be changed.");

      return res.redirect(`/admin/bookings/${booking._id}`);
    }

    // Update booking status
    booking.status = status;

    await booking.save();

    req.success(`Booking status changed to ${status}.`);

    res.redirect(`/admin/bookings/${booking._id}`);
  } catch (error) {
    console.log("ADMIN UPDATE BOOKING STATUS ERROR:", error);

    req.error("Unable to update booking status.");

    res.redirect("/admin/bookings");
  }
});

module.exports = router;
