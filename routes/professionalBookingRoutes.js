const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const isProfessional = require("../middleware/professionalMiddleware");

const {
  validateObjectId,
  validateBookingStatus,
  validateCancellationReason,
} = require("../utils/validators");

// ==========================================
// PROFESSIONAL BOOKINGS
// ==========================================
router.get("/bookings", isProfessional, async (req, res) => {
  try {
    const professionalId = req.session.userId;

    // ==========================================
    // VALIDATE PROFESSIONAL SESSION
    // ==========================================

    if (!validateObjectId(professionalId)) {
      req.error("Invalid professional session.");
      return res.redirect("/professional/dashboard");
    }

    const {
      search = "",
      startDate = "",
      endDate = "",
      status = "",
      new: newFilter = "",
    } = req.query;

    // ==========================================
    // VALIDATE SEARCH
    // ==========================================

    const searchText = String(search).trim();

    if (searchText.length > 100) {
      req.error("Search text is too long.");
      return res.redirect("/professional/bookings");
    }

    // ==========================================
    // VALIDATE STATUS FILTER
    // ==========================================

    if (status) {
      const statusError = validateBookingStatus(status);

      if (statusError) {
        req.error(statusError);
        return res.redirect("/professional/bookings");
      }
    }

    // ==========================================
    // VALIDATE NEW FILTER
    // ==========================================

    if (newFilter && newFilter !== "true") {
      req.error("Invalid booking filter.");
      return res.redirect("/professional/bookings");
    }

    // ==========================================
    // VALIDATE DATE FILTERS
    // ==========================================

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);

      if (isNaN(start.getTime())) {
        req.error("Invalid start date.");
        return res.redirect("/professional/bookings");
      }
    }

    if (endDate) {
      const end = new Date(`${endDate}T00:00:00`);

      if (isNaN(end.getTime())) {
        req.error("Invalid end date.");
        return res.redirect("/professional/bookings");
      }
    }

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);

      if (start > end) {
        req.error("Start date cannot be after end date.");
        return res.redirect("/professional/bookings");
      }
    }

    // ==========================================
    // TODAY'S BOOKINGS
    // ==========================================

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

    // ==========================================
    // GET ALL BOOKINGS
    // ==========================================

    let bookings = await Booking.find({
      professional: professionalId,
    })
      .populate("customer")
      .populate("service")
      .populate("company")
      .sort({ bookingDate: -1 });

    // ==========================================
    // TEXT SEARCH
    // ==========================================

    if (searchText) {
      const normalizedSearch = searchText.toLowerCase();

      bookings = bookings.filter((booking) => {
        const customerName =
          booking.customer?.name?.toLowerCase() || "";

        const customerEmail =
          booking.customer?.email?.toLowerCase() || "";

        const customerMobile =
          booking.customer?.mobile?.toLowerCase() || "";

        const serviceName =
          booking.service?.name?.toLowerCase() || "";

        const serviceCategory =
          booking.service?.category?.toLowerCase() || "";

        const serviceDescription =
          booking.service?.description?.toLowerCase() || "";

        const companyName =
          booking.company?.name?.toLowerCase() || "";

        const companyCategory =
          booking.company?.category?.toLowerCase() || "";

        const companyCity =
          booking.company?.city?.toLowerCase() || "";

        const message =
          booking.message?.toLowerCase() || "";

        const bookingStatus =
          booking.status?.toLowerCase() || "";

        return (
          customerName.includes(normalizedSearch) ||
          customerEmail.includes(normalizedSearch) ||
          customerMobile.includes(normalizedSearch) ||
          serviceName.includes(normalizedSearch) ||
          serviceCategory.includes(normalizedSearch) ||
          serviceDescription.includes(normalizedSearch) ||
          companyName.includes(normalizedSearch) ||
          companyCategory.includes(normalizedSearch) ||
          companyCity.includes(normalizedSearch) ||
          message.includes(normalizedSearch) ||
          bookingStatus.includes(normalizedSearch)
        );
      });
    }

    // ==========================================
    // DATE FILTER
    // ==========================================

    if (startDate || endDate) {
      bookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);

        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          start.setHours(0, 0, 0, 0);

          if (bookingDate < start) {
            return false;
          }
        }

        if (endDate) {
          const end = new Date(`${endDate}T00:00:00`);
          end.setHours(23, 59, 59, 999);

          if (bookingDate > end) {
            return false;
          }
        }

        return true;
      });
    }

    // ==========================================
    // STATUS FILTER
    // ==========================================

    if (status) {
      bookings = bookings.filter(
        (booking) => booking.status === status,
      );
    }

    // ==========================================
    // NEW BOOKINGS FILTER
    // ==========================================

    if (newFilter === "true") {
      bookings = bookings.filter(
        (booking) => booking.professionalSeen === false,
      );
    }

    // ==========================================
    // BOOKING COUNTS
    // ==========================================

    const pendingBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "pending",
    });

    const confirmedBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "confirmed",
    });

    const completedBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "completed",
    });

    const cancelledBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      status: "cancelled",
    });

    // ==========================================
    // NEW BOOKINGS
    // ==========================================

    const newBookingsCount = await Booking.countDocuments({
      professional: professionalId,
      professionalSeen: false,
    });

    // ==========================================
    // SEARCH ACTIVE
    // ==========================================

    const isSearchActive = Boolean(
      searchText ||
      startDate ||
      endDate ||
      status ||
      newFilter === "true",
    );

    // ==========================================
    // RENDER
    // ==========================================

    res.render("professional/bookings", {
      bookings,
      todayBookings,

      search,
      startDate,
      endDate,
      status,

      isSearchActive,
      newFilter,
      pendingBookingsCount,
      confirmedBookingsCount,
      completedBookingsCount,
      cancelledBookingsCount,
      newBookingsCount,
    });
  } catch (error) {
    console.log("PROFESSIONAL BOOKINGS ERROR:", error);

    req.error("Unable to load professional bookings.");

    return res.redirect("/professional/dashboard");
  }
});

// =========================================
// BOOKING DETAIL ROUTE
// =========================================
router.get(
  "/bookings/:bookingId",
  isProfessional,
  async (req, res) => {
    try {
      // ==========================================
      // VALIDATE BOOKING ID
      // ==========================================

      const bookingIdError = validateObjectId(
        req.params.bookingId,
      );

      if (bookingIdError) {
        req.error("Invalid booking ID.");
        return res.redirect("/professional/bookings");
      }

      // ==========================================
      // FIND BOOKING
      // ==========================================

      const booking = await Booking.findOne({
        _id: req.params.bookingId,
        professional: req.session.userId,
      })
        .populate("customer")
        .populate("service")
        .populate("company");

      if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/professional/bookings");
      }

      // ==========================================
      // MARK BOOKING AS SEEN
      // ==========================================

      if (!booking.professionalSeen) {
        booking.professionalSeen = true;
        await booking.save();
      }

      res.render("professional/bookingDetails", {
        booking,
      });
    } catch (err) {
      console.error(
        "Professional booking details error:",
        err,
      );

      req.flash(
        "error",
        "Unable to load booking details.",
      );

      res.redirect("/professional/bookings");
    }
  },
);

// ==========================================
// CONFIRM BOOKING
// ==========================================
router.post(
  "/bookings/:bookingId/confirm",
  isProfessional,
  async (req, res) => {
    try {
      // ==========================================
      // VALIDATE BOOKING ID
      // ==========================================

      const bookingIdError = validateObjectId(
        req.params.bookingId,
      );

      if (bookingIdError) {
        req.error("Invalid booking ID.");
        return res.redirect("/professional/bookings");
      }

      const booking = await Booking.findOne({
        _id: req.params.bookingId,
        professional: req.session.userId,
      });

      if (!booking) {
        req.error("Booking not found.");
        return res.redirect("/professional/bookings");
      }

      // Only pending bookings can be confirmed
      if (booking.status !== "pending") {
        req.error(
          "Only pending bookings can be confirmed.",
        );

        return res.redirect("/professional/bookings");
      }

      booking.status = "confirmed";

      await booking.save();

      req.success("Booking confirmed successfully.");

      return res.redirect("/professional/bookings");
    } catch (error) {
      console.log("CONFIRM BOOKING ERROR:", error);

      req.error(
        "Unable to confirm the booking. Please try again.",
      );

      return res.redirect("/professional/bookings");
    }
  },
);

// ==========================================
// CANCEL BOOKING
// ==========================================
router.post(
  "/bookings/:bookingId/cancel",
  isProfessional,
  async (req, res) => {
    try {
      // ==========================================
      // VALIDATE BOOKING ID
      // ==========================================

      const bookingIdError = validateObjectId(
        req.params.bookingId,
      );

      if (bookingIdError) {
        req.error("Invalid booking ID.");
        return res.redirect("/professional/bookings");
      }

      const booking = await Booking.findOne({
        _id: req.params.bookingId,
        professional: req.session.userId,
      });

      if (!booking) {
        req.error("Booking not found.");
        return res.redirect("/professional/bookings");
      }

      // Completed bookings cannot be cancelled
      if (booking.status === "completed") {
        req.error(
          "Completed bookings cannot be cancelled.",
        );

        return res.redirect("/professional/bookings");
      }

      // Cancelled bookings cannot be cancelled again
      if (booking.status === "cancelled") {
        req.error(
          "This booking is already cancelled.",
        );

        return res.redirect("/professional/bookings");
      }

      // ==========================================
      // GET CANCELLATION REASON
      // ==========================================

      const { cancellationReason } = req.body;

      // ==========================================
      // VALIDATE CANCELLATION REASON
      // ==========================================

      const cancellationReasonError =
        validateCancellationReason(cancellationReason);

      if (cancellationReasonError) {
        req.error(cancellationReasonError);

        return res.redirect(
          `/professional/bookings/${booking._id}`,
        );
      }

      // ==========================================
      // SAVE CANCELLATION DETAILS
      // ==========================================

      booking.status = "cancelled";
      booking.cancellationReason =
        cancellationReason.trim();
      booking.cancelledBy = req.session.userId;
      booking.cancelledAt = new Date();

      await booking.save();

      req.success(
        "Booking cancelled successfully.",
      );

      return res.redirect("/professional/bookings");
    } catch (error) {
      console.log("CANCEL BOOKING ERROR:", error);

      req.error(
        "Unable to cancel the booking. Please try again.",
      );

      return res.redirect("/professional/bookings");
    }
  },
);

// ==========================================
// MARK BOOKING AS COMPLETED
// ==========================================
router.post(
  "/bookings/:bookingId/complete",
  isProfessional,
  async (req, res) => {
    try {
      // ==========================================
      // VALIDATE BOOKING ID
      // ==========================================

      const bookingIdError = validateObjectId(
        req.params.bookingId,
      );

      if (bookingIdError) {
        req.error("Invalid booking ID.");
        return res.redirect("/professional/bookings");
      }

      const booking = await Booking.findOne({
        _id: req.params.bookingId,
        professional: req.session.userId,
      });

      if (!booking) {
        req.error("Booking not found.");
        return res.redirect("/professional/bookings");
      }

      // Only confirmed bookings can be completed
      if (booking.status !== "confirmed") {
        req.error(
          "Only confirmed bookings can be marked as completed.",
        );

        return res.redirect("/professional/bookings");
      }

      booking.status = "completed";

      await booking.save();

      req.success(
        "Booking marked as completed successfully.",
      );

      return res.redirect("/professional/bookings");
    } catch (error) {
      console.log("COMPLETE BOOKING ERROR:", error);

      req.error(
        "Unable to complete the booking. Please try again.",
      );

      return res.redirect("/professional/bookings");
    }
  },
);

module.exports = router;