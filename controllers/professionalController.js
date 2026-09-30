
const Company = require("../models/company");
const User = require("../models/user");
const Service = require("../models/service");
const Booking = require("../models/booking");

// ==========================================
// CENTRAL VALIDATORS
// ==========================================

const {
  validateName,
  validateEmail,
  validateMobile,
  validateAddress,
  validateLocation,

  validateConsultancy,
  validateCategory,
  validateSpecialization,
  validateExperience,
  validateSkills,
  validateProfessionalDescription,
  validateAbout,

  validateCompanyName,
  validateDescription,
  validateCity,
  validateWebsite,

  validateObjectId,
} = require("../utils/validators");

// ==========================================
// VALIDATION HELPER
// ==========================================
//
// This helper supports validators that return:
// - a string message
// - false
// - an object such as { valid, message }
// - true / null / undefined when valid
//
// ==========================================

const getValidationError = (validator, value) => {
  try {
    const result = validator(value);

    if (result === true || result === null || result === undefined) {
      return null;
    }

    if (typeof result === "string") {
      return result;
    }

    if (typeof result === "object") {
      if (result.valid === false) {
        return result.message || "Invalid value.";
      }

      if (result.error) {
        return result.error;
      }

      if (result.message && result.valid !== true) {
        return result.message;
      }
    }

    if (result === false) {
      return "Invalid value.";
    }

    return null;
  } catch (error) {
    return error.message || "Invalid value.";
  }
};

// ==========================================
// PROFESSIONAL DASHBOARD
// ==========================================

exports.dashboard = async (req, res) => {
  try {
    const professionalId = req.session.userId;

    const {
      search = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const isSearchActive = Boolean(
      search || startDate || endDate
    );

    // ------------------------------------------
    // TODAY'S DATE
    // ------------------------------------------

    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // ------------------------------------------
    // TODAY'S BOOKINGS
    // ------------------------------------------

    const todayBookings = await Booking.find({
      professional: professionalId,
      bookingDate: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    })
      .populate("customer")
      .populate("service")
      .populate("company")
      .sort({ bookingDate: 1 });

    // ------------------------------------------
    // NEW BOOKINGS
    // ------------------------------------------

    const newBookings = await Booking.find({
      professional: professionalId,
      professionalSeen: false,
    })
      .populate("customer")
      .populate("service")
      .populate("company")
      .sort({ createdAt: -1 });

    // ------------------------------------------
    // NEW BOOKINGS COUNT
    // ------------------------------------------

    const newBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      professionalSeen: false,
    });

    // ------------------------------------------
    // PENDING BOOKINGS COUNT
    // ------------------------------------------

    const pendingBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "pending",
    });

    // ------------------------------------------
    // CONFIRMED BOOKINGS COUNT
    // ------------------------------------------

    const confirmedBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "confirmed",
    });

    // ------------------------------------------
    // COMPLETED BOOKINGS COUNT
    // ------------------------------------------

    const completedBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "completed",
    });

    // ------------------------------------------
    // TODAY'S BOOKINGS COUNT
    // ------------------------------------------

    const todayBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      bookingDate: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    });

    // ------------------------------------------
    // RECENT BOOKINGS
    // ------------------------------------------

    const recentBookings = await Booking.find({
      professional: professionalId,
    })
      .populate("customer")
      .populate("service")
      .populate("company")
      .sort({ createdAt: -1 })
      .limit(5);

    // ------------------------------------------
    // PROFESSIONAL SERVICES
    // ------------------------------------------

    const servicesCount = await Service.countDocuments({
      professional: professionalId,
    });

    // ------------------------------------------
    // PROFESSIONAL
    // ------------------------------------------

    const currentUser = await User.findById(professionalId);

    if (!currentUser) {
      req.error("Professional profile not found.");
      return res.redirect("/login");
    }

    // ------------------------------------------
    // COMPANY
    // ------------------------------------------

    const company = await Company.findOne({
      owner: professionalId,
    });

    // ------------------------------------------
    // RENDER DASHBOARD
    // ------------------------------------------

    res.render("professional/dashboard", {
      currentUser,
      company,

      todayBookings,
      todayBookingsCount,

      newBookings,
      newBookingsCount,

      recentBookings,

      pendingBookingsCount,
      confirmedBookingsCount,
      completedBookingsCount,

      servicesCount,

      search,
      startDate,
      endDate,
      isSearchActive,
    });
  } catch (error) {
    console.log("PROFESSIONAL DASHBOARD ERROR:", error);

    req.error("Unable to load professional dashboard.");

    return res.redirect("/login");
  }
};

// ==========================================
// COMPANY FORM
// ==========================================

exports.companyForm = (req, res) => {
  res.render("professional/company", {
    pageTitle: "creat-company",
  });
};

// ==========================================
// CREATE COMPANY
// ==========================================

exports.createCompany = async (req, res) => {
  try {
    // ------------------------------------------
    // CHECK EXISTING COMPANY
    // ------------------------------------------

    const existingCompany = await Company.findOne({
      owner: req.session.userId,
    });

    if (existingCompany) {
      req.error(
        "You already have a company. You can edit your existing company.",
      );

      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // GET FORM DATA
    // ------------------------------------------

    const {
      name,
      description,
      category,
      email,
      mobile,
      address,
      city,
      website,
    } = req.body;

    // ------------------------------------------
    // VALIDATE COMPANY NAME
    // ------------------------------------------

    let validationError;

    validationError = getValidationError(
      validateCompanyName,
      name,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE DESCRIPTION
    // ------------------------------------------

    validationError = getValidationError(
      validateDescription,
      description,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE CATEGORY
    // ------------------------------------------

    validationError = getValidationError(
      validateCategory,
      category,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE EMAIL
    // ------------------------------------------

    validationError = getValidationError(
      validateEmail,
      email,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE MOBILE
    // ------------------------------------------

    validationError = getValidationError(
      validateMobile,
      mobile,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE ADDRESS
    // ------------------------------------------

    validationError = getValidationError(
      validateAddress,
      address,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE CITY
    // ------------------------------------------

    validationError = getValidationError(
      validateCity,
      city,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // VALIDATE WEBSITE
    // ------------------------------------------

    validationError = getValidationError(
      validateWebsite,
      website,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company");
    }

    // ------------------------------------------
    // CREATE COMPANY
    // ------------------------------------------

    const company = new Company({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      address: address.trim(),
      city: city.trim(),
      website: website ? website.trim() : "",

      owner: req.session.userId,
    });

    await company.save();

    req.success("Company created successfully!");

    return res.redirect("/professional/dashboard");
  } catch (error) {
    console.log("COMPANY CREATION ERROR:");
    console.log(error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      req.error(
        "A company with this information already exists.",
      );

      return res.redirect("/professional/company");
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      req.error(message);

      return res.redirect("/professional/company");
    }

    req.error(
      "Unable to create your company. Please try again.",
    );

    return res.redirect("/professional/company");
  }
};

// ==========================================
// EDIT COMPANY
// ==========================================

exports.editCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      owner: req.session.userId,
    });

    if (!company) {
      req.error("Please create your company first.");

      return res.redirect("/professional/company");
    }

    res.render("professional/editCompany", {
      company,
    });
  } catch (error) {
    console.error("Edit company error:", error);

    req.error("Unable to load company details.");

    return res.redirect("/professional/dashboard");
  }
};

// ==========================================
// UPDATE COMPANY
// ==========================================

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      owner: req.session.userId,
    });

    if (!company) {
      req.error("Company not found.");

      return res.redirect("/professional/dashboard");
    }

    const {
      name,
      description,
      category,
      email,
      mobile,
      address,
      city,
      website,
    } = req.body;

    let validationError;

    // ------------------------------------------
    // VALIDATE COMPANY NAME
    // ------------------------------------------

    validationError = getValidationError(
      validateCompanyName,
      name,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE DESCRIPTION
    // ------------------------------------------

    validationError = getValidationError(
      validateDescription,
      description,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE CATEGORY
    // ------------------------------------------

    validationError = getValidationError(
      validateCategory,
      category,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE EMAIL
    // ------------------------------------------

    validationError = getValidationError(
      validateEmail,
      email,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE MOBILE
    // ------------------------------------------

    validationError = getValidationError(
      validateMobile,
      mobile,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE ADDRESS
    // ------------------------------------------

    validationError = getValidationError(
      validateAddress,
      address,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE CITY
    // ------------------------------------------

    validationError = getValidationError(
      validateCity,
      city,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // VALIDATE WEBSITE
    // ------------------------------------------

    validationError = getValidationError(
      validateWebsite,
      website,
    );

    if (validationError) {
      req.error(validationError);
      return res.redirect("/professional/company/edit");
    }

    // ------------------------------------------
    // UPDATE BASIC COMPANY INFORMATION
    // ------------------------------------------

    company.name = name.trim();
    company.description = description.trim();
    company.category = category.trim();
    company.email = email.trim().toLowerCase();
    company.mobile = mobile.trim();
    company.address = address.trim();
    company.city = city.trim();
    company.website = website ? website.trim() : "";

    // ==========================================
    // OFFICE HOURS
    // ==========================================

    const officeHours = req.body.officeHours || {};

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    company.officeHours = {};

    days.forEach((day) => {
      const dayData = officeHours[day] || {};

      company.officeHours[day] = {
        isOpen: dayData.isOpen === "true",
        open: dayData.open || null,
        close: dayData.close || null,
      };
    });

    await company.save();

    req.success(
      "Company details updated successfully.",
    );

    return res.redirect("/professional/company");
  } catch (error) {
    console.error("Update company error:", error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      req.error(
        "A company with this information already exists.",
      );

      return res.redirect("/professional/company/edit");
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      req.error(message);

      return res.redirect("/professional/company/edit");
    }

    req.error(
      "Unable to update company details.",
    );

    return res.redirect("/professional/company/edit");
  }
};

// ==========================================
// PROFESSIONAL PROFILE
// ==========================================

exports.profile = async (req, res) => {
  try {
    // ------------------------------------------
    // CHECK LOGIN
    // ------------------------------------------

    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    // ------------------------------------------
    // GET PROFESSIONAL
    // ------------------------------------------

    const user = await User.findById(
      req.session.userId,
    );

    if (!user) {
      req.error(
        "Professional profile not found.",
      );

      return res.redirect(
        "/professional/dashboard",
      );
    }

    // ------------------------------------------
    // GET COMPANY
    // ------------------------------------------

    const company = await Company.findOne({
      owner: user._id,
    });

    // ------------------------------------------
    // GET PROFESSIONAL SERVICES
    // ------------------------------------------

    const services = await Service.find({
      professional: user._id,
    }).sort({
      createdAt: -1,
    });

    // ------------------------------------------
    // RENDER PROFILE
    // ------------------------------------------

    res.render("professional/profile", {
      user,
      company,
      services,
    });
  } catch (error) {
    console.log(
      "PROFESSIONAL PROFILE ERROR:",
      error,
    );

    req.error(
      "Unable to load professional profile.",
    );

    return res.redirect(
      "/professional/dashboard",
    );
  }
};

// ==========================================
// EDIT PROFESSIONAL PROFILE
// ==========================================

exports.editProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    const user = await User.findById(
      req.session.userId,
    );

    if (!user) {
      req.error(
        "Professional profile not found.",
      );

      return res.redirect(
        "/professional/dashboard",
      );
    }

    res.render("professional/edit-profile", {
      user,
    });
  } catch (error) {
    console.log(
      "EDIT PROFESSIONAL PROFILE ERROR:",
      error,
    );

    req.error(
      "Unable to open edit profile.",
    );

    return res.redirect(
      "/professional/profile",
    );
  }
};

// ==========================================
// UPDATE PROFESSIONAL PROFILE
// ==========================================

exports.updateProfile = async (req, res) => {
  try {
    // ------------------------------------------
    // CHECK LOGIN
    // ------------------------------------------

    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    // ------------------------------------------
    // GET FORM DATA
    // ------------------------------------------

    const {
      name,
      email,
      mobile,
      location,
      address,

      consultancy,
      category,
      specialization,
      experience,
      skills,
      professionalDescription,
      about,
    } = req.body;

    // ------------------------------------------
    // GET CURRENT USER
    // ------------------------------------------

    const user = await User.findById(
      req.session.userId,
    );

    if (!user) {
      req.error(
        "Professional profile not found.",
      );

      return res.redirect(
        "/professional/dashboard",
      );
    }

    let validationError;

    // ==========================================
    // BASIC INFORMATION VALIDATION
    // ==========================================

    validationError = getValidationError(
      validateName,
      name,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateEmail,
      email,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateMobile,
      mobile,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateAddress,
      address,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateLocation,
      location,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    // ==========================================
    // PROFESSIONAL INFORMATION VALIDATION
    // ==========================================

    validationError = getValidationError(
      validateConsultancy,
      consultancy,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateCategory,
      category,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateSpecialization,
      specialization,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateExperience,
      experience,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateSkills,
      skills,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateProfessionalDescription,
      professionalDescription,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    validationError = getValidationError(
      validateAbout,
      about,
    );

    if (validationError) {
      req.error(validationError);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    // ==========================================
    // DUPLICATE EMAIL CHECK
    // ==========================================

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: {
        $ne: req.session.userId,
      },
    });

    if (existingUser) {
      req.error(
        "This email address is already registered.",
      );

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    // ==========================================
    // UPDATE BASIC INFORMATION
    // ==========================================

    user.name = name.trim();
    user.email = normalizedEmail;
    user.mobile = mobile.trim();
    user.location = location
      ? location.trim()
      : "";
    user.address = address.trim();

    // ==========================================
    // UPDATE PROFESSIONAL INFORMATION
    // ==========================================

    user.consultancy = consultancy
      ? consultancy.trim()
      : "";

    user.category = category
      ? category.trim()
      : "";

    user.specialization = specialization
      ? specialization.trim()
      : "";

    user.experience = experience
      ? experience.trim()
      : "";

    user.skills = skills
      ? skills.trim()
      : "";

    user.professionalDescription =
      professionalDescription
        ? professionalDescription.trim()
        : "";

    user.about = about
      ? about.trim()
      : "";

    // ==========================================
    // SAVE
    // ==========================================

    await user.save();

    req.success(
      "Professional profile updated successfully!",
    );

    return res.redirect(
      "/professional/profile",
    );
  } catch (error) {
    console.log(
      "UPDATE PROFESSIONAL PROFILE ERROR:",
      error,
    );

    // MongoDB duplicate key
    if (error.code === 11000) {
      req.error(
        "This email address is already registered.",
      );

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      req.error(message);

      return res.redirect(
        "/professional/profile/edit",
      );
    }

    req.error(
      "Unable to update your profile.",
    );

    return res.redirect(
      "/professional/profile/edit",
    );
  }
};

// ==========================================
// PUBLIC PROFESSIONAL DETAILS
// ==========================================

exports.professionalDetails = async (
  req,
  res,
) => {
  try {
    console.log(
      "REQUESTED PROFESSIONAL SLUG:",
      req.params.slug,
    );

    // ------------------------------------------
    // FIND PROFESSIONAL BY SLUG
    // ------------------------------------------

    const professional = await User.findOne({
      slug: req.params.slug,
      role: "professional",
    });

    console.log(
      "FOUND PROFESSIONAL:",
      professional,
    );

    // ------------------------------------------
    // PROFESSIONAL NOT FOUND
    // ------------------------------------------

    if (!professional) {
      req.error("Professional not found.");

      return res.redirect("/services");
    }

    // ------------------------------------------
    // FIND COMPANY
    // ------------------------------------------

    const company = await Company.findOne({
      owner: professional._id,
    });

    // ------------------------------------------
    // FIND SERVICES
    // ------------------------------------------

    const services = await Service.find({
      professional: professional._id,
    })
      .populate("company")
      .sort({
        createdAt: -1,
      });

    // ------------------------------------------
    // RENDER PUBLIC PROFESSIONAL PAGE
    // ------------------------------------------

    res.render(
      "customer/professionalDetails",
      {
        professional,
        company,
        services,
        pageTitle: professional.name,
      },
    );
  } catch (error) {
    console.log(
      "PROFESSIONAL DETAILS ERROR:",
      error,
    );

    req.error(
      "Unable to load professional.",
    );

    return res.redirect("/services");
  }
};

// =====================================
// TOGGLE SERVICE BOOKING AVAILABILITY
// =====================================

exports.toggleBookingAvailability = async (
  req,
  res,
) => {
  try {
    // ------------------------------------------
    // VALIDATE SERVICE ID
    // ------------------------------------------

    const validationError =
      getValidationError(
        validateObjectId,
        req.params.id,
      );

    if (validationError) {
      req.error("Invalid service.");

      return res.redirect(
        "/professional/dashboard",
      );
    }

    // ------------------------------------------
    // FIND SERVICE OWNED BY PROFESSIONAL
    // ------------------------------------------

    const service = await Service.findOne({
      _id: req.params.id,
      professional: req.session.userId,
    });

    if (!service) {
      req.error(
        "Service not found or you do not have permission to manage it.",
      );

      return res.redirect(
        "/professional/dashboard",
      );
    }

    // ------------------------------------------
    // TOGGLE BOOKING AVAILABILITY
    // ------------------------------------------

    service.isBookingAvailable =
      !service.isBookingAvailable;

    await service.save();

    const status =
      service.isBookingAvailable
        ? "enabled"
        : "disabled";

    req.success(
      `Booking availability has been ${status} successfully.`,
    );

    return res.redirect(
      "/professional/dashboard",
    );
  } catch (error) {
    console.log(
      "PROFESSIONAL BOOKING AVAILABILITY ERROR:",
      error,
    );

    req.error(
      "Unable to update booking availability.",
    );

    return res.redirect(
      "/professional/dashboard",
    );
  }
};

