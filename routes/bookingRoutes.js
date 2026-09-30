const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Service = require("../models/service");
const isLoggedIn = require("../middleware/isLoggedIn");
const Settings = require("../models/settings");

const {
  validateSlug,
  validateBookingDate,
  validateBookingMessage,
  validateObjectId,
} = require("../utils/validators");

// =====================================
// SHOW BOOKING FORM
// =====================================

router.get("/book/:slug", isLoggedIn, async (req, res) => {
  try {
    // Validate service slug
    const slugError = validateSlug(req.params.slug);

    if (slugError) {
      req.error("Invalid service.");
      return res.redirect("/services");
    }

    // Check admin booking setting
    const settings = await Settings.findOne();

    if (settings && settings.allowBookings === false) {
      req.error("New bookings are currently unavailable.");
      return res.redirect(`/services/${req.params.slug}`);
    }

    // Check login
    if (!req.session.userId) {
      req.session.returnTo = `/customer/book/${req.params.slug}`;
      req.error("Please log in to book a service.");
      return res.redirect("/login");
    }

    // Only customers can book
    if (req.session.role !== "customer") {
      req.error("Only customer accounts can book a service.");
      return res.redirect("/services");
    }

    // Validate logged-in user ID
    const userIdError = validateObjectId(req.session.userId);

    if (userIdError) {
      req.error(userIdError);
      return res.redirect("/login");
    }
    // Find service
    const service = await Service.findOne({
      slug: req.params.slug,
    })
      .populate("company")
      .populate("professional");

    if (!service) {
      req.error("Service not found.");
      return res.redirect("/services");
    }

    // Check individual service availability
    if (service.isAvailable === false) {
      req.error("This service is currently unavailable.");
      return res.redirect(`/services/${service.slug}`);
    }

    res.render("customer/booking", {
      service,
      pageTitle: `Book ${service.name}`,
    });
  } catch (error) {
    console.log("BOOKING FORM ERROR:", error);

    req.error("Unable to open the booking form.");
    res.redirect("/services");
  }
});

// =====================================
// CREATE BOOKING
// =====================================

router.post("/book/:slug", isLoggedIn, async (req, res) => {
  try {
    // =====================================
    // VALIDATE SERVICE SLUG
    // =====================================

    const slugError = validateSlug(req.params.slug);

    if (slugError) {
      req.error("Invalid service.");
      return res.redirect("/services");
    }

    // =====================================
    // CHECK ADMIN SETTINGS
    // =====================================

    const settings = await Settings.findOne();

    const defaultBookingStatus = settings?.defaultBookingStatus || "pending";

    if (settings && settings.allowBookings === false) {
      req.error("New bookings are currently unavailable.");

      return res.redirect(`/services/${req.params.slug}`);
    }

    // =====================================
    // CHECK CUSTOMER LOGIN
    // =====================================

    if (!req.session.userId) {
      req.session.returnTo = `/customer/book/${req.params.slug}`;

      req.error("Please log in to book a service.");

      return res.redirect("/login");
    }

    // Validate logged-in user ID
    const userIdError = validateObjectId(req.session.userId);

    if (userIdError) {
      req.error(userIdError);
      return res.redirect("/login");
    }

    // =====================================
    // CHECK USER ROLE
    // =====================================

    if (req.session.role !== "customer") {
      req.error("Only customer accounts can create bookings.");

      return res.redirect(`/services/${req.params.slug}`);
    }

    // =====================================
    // FIND SERVICE
    // =====================================

    const service = await Service.findOne({
      slug: req.params.slug,
    });

    if (!service) {
      req.error("Service not found.");

      return res.redirect("/services");
    }

    // =====================================
    // CHECK SERVICE AVAILABILITY
    // =====================================

    if (service.isAvailable === false) {
      req.error("This service is currently unavailable for booking.");

      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // VALIDATE SERVICE REFERENCES
    // =====================================

    if (!validateObjectId(service._id)) {
      req.error("Invalid service.");
      return res.redirect("/services");
    }

    if (!validateObjectId(service.professional)) {
      req.error("This service has an invalid professional.");
      return res.redirect(`/services/${service.slug}`);
    }

    if (!validateObjectId(service.company)) {
      req.error("This service has an invalid company.");
      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // GET BOOKING DATA
    // =====================================

    const { bookingDate, message } = req.body;

    // =====================================
    // VALIDATE BOOKING DATE
    // =====================================

    const bookingDateError = validateBookingDate(bookingDate);

    if (bookingDateError) {
      req.error(bookingDateError);

      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // VALIDATE BOOKING MESSAGE
    // =====================================

    const messageError = validateBookingMessage(message);

    if (messageError) {
      req.error(messageError);

      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // CONVERT DATE
    // =====================================

    const selectedDate = new Date(bookingDate);

    if (isNaN(selectedDate.getTime())) {
      req.error("Invalid booking date.");

      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // CHECK FUTURE DATE
    // =====================================

    if (selectedDate <= new Date()) {
      req.error("Please select a future date and time.");

      return res.redirect(`/services/${service.slug}`);
    }

    // =====================================
    // CREATE BOOKING
    // =====================================

    const booking = new Booking({
      customer: req.session.userId,

      service: service._id,

      professional: service.professional,

      company: service.company,

      bookingDate: selectedDate,

      message: message ? message.trim() : undefined,

      adminSeen: false,

      professionalSeen: false,

      status: defaultBookingStatus,
    });

    // =====================================
    // SAVE BOOKING
    // =====================================

    await booking.save();

    req.success("Your service has been booked successfully!");

    return res.redirect("/customer/bookings");
  } catch (error) {
    console.log("CREATE BOOKING ERROR:", error);

    req.error("Unable to create your booking. Please try again.");

    return res.redirect("/services");
  }
});

// =====================================
// CUSTOMER BOOKINGS
// =====================================

router.get("/bookings", isLoggedIn, async (req, res) => {
  try {
    // =====================================
    // CHECK LOGIN
    // =====================================

    const settings = await Settings.findOne();

    if (!req.session.userId) {
      req.error("Please log in to view your bookings.");
      return res.redirect("/login");
    }

    // Validate logged-in user ID
    const userIdError = validateObjectId(req.session.userId);

    if (userIdError) {
      req.error(userIdError);
      return res.redirect("/login");
    }

    // =====================================
    // FIND CUSTOMER BOOKINGS
    // =====================================

    const bookings = await Booking.find({
      customer: req.session.userId,
    })
      .populate("service")
      .populate("professional")
      .populate("company")
      .sort({
        createdAt: -1,
      });

    // =====================================
    // RENDER
    // =====================================

    res.render("customer/bookings", {
      bookings,
      settings,
    });
  } catch (error) {
    console.log("CUSTOMER BOOKINGS ERROR:", error);

    req.error("Unable to load your bookings.");
    res.redirect("/customer/dashboard");
  }
});

// =====================================
// CANCEL CUSTOMER BOOKING
// =====================================

router.post("/bookings/:id/cancel", isLoggedIn, async (req, res) => {
  try {
    // =====================================
    // VALIDATE BOOKING ID
    // =====================================

    if (!validateObjectId(req.params.id)) {
      req.error("Invalid booking ID.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // CHECK LOGIN
    // =====================================

    if (!req.session.userId) {
      req.error("Please log in to cancel a booking.");
      return res.redirect("/login");
    }

    // Validate logged-in user ID
    const userIdError = validateObjectId(req.session.userId);

    if (userIdError) {
      req.error(userIdError);
      return res.redirect("/login");
    }

    // =====================================
    // CHECK ADMIN SETTING
    // =====================================

    const settings = await Settings.findOne();

    if (settings && settings.allowCustomerCancellation === false) {
      req.error("Customer cancellation is currently disabled.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // FIND BOOKING
    // =====================================

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.session.userId,
    });

    if (!booking) {
      req.error("Booking not found.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // COMPLETED BOOKING
    // =====================================

    if (booking.status === "completed") {
      req.error("Completed bookings cannot be cancelled.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // ALREADY CANCELLED
    // =====================================

    if (booking.status === "cancelled") {
      req.error("This booking is already cancelled.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // APPOINTMENT ALREADY PASSED
    // =====================================

    if (new Date(booking.bookingDate) <= new Date()) {
      req.error("Past bookings cannot be cancelled.");
      return res.redirect("/customer/bookings");
    }

    // =====================================
    // CANCEL BOOKING
    // =====================================

    booking.status = "cancelled";

    await booking.save();

    req.success("Booking cancelled successfully.");

    res.redirect("/customer/bookings");
  } catch (error) {
    console.log("CUSTOMER CANCEL BOOKING ERROR:", error);

    req.error("Unable to cancel booking.");

    res.redirect("/customer/bookings");
  }
});

module.exports = router;
