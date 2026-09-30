const express = require("express");

const router = express.Router();

const isProfessional = require("../middleware/professionalMiddleware");

const professionalController = require("../controllers/professionalController");

const {
  validateSlug,
  validateObjectId,
} = require("../utils/validators");

// =====================================
// PROFESSIONAL DASHBOARD
// =====================================

router.get(
  "/dashboard",
  isProfessional,
  professionalController.dashboard
);

// =====================================
// PROFESSIONAL PROFILE
// =====================================

router.get(
  "/profile",
  isProfessional,
  professionalController.profile
);

// =====================================
// EDIT PROFESSIONAL PROFILE
// =====================================

router.get(
  "/profile/edit",
  isProfessional,
  professionalController.editProfile
);

router.post(
  "/profile/edit",
  isProfessional,
  professionalController.updateProfile
);

// =====================================
// COMPANY
// =====================================

router.get(
  "/company",
  isProfessional,
  professionalController.companyForm
);

router.post(
  "/company",
  isProfessional,
  professionalController.createCompany
);

// =====================================
// PROFESSIONAL DETAILS USING SLUG
// =====================================

router.get("/:slug", async (req, res, next) => {
  try {
    const slugError = validateSlug(req.params.slug);

    if (slugError) {
      req.error("Invalid professional profile.");
      return res.redirect("/services");
    }

    return professionalController.professionalDetails(
      req,
      res,
      next
    );
  } catch (error) {
    next(error);
  }
});

// =====================================
// TOGGLE SERVICE BOOKING AVAILABILITY
// =====================================

router.post(
  "/services/:id/booking-availability",
  isProfessional,
  (req, res, next) => {
    const idError = validateObjectId(req.params.id);

    if (idError) {
      req.error("Invalid service ID.");
      return res.redirect("/professional/dashboard");
    }

    next();
  },
  professionalController.toggleBookingAvailability
);

// =====================================
// EDIT COMPANY
// =====================================

router.get(
  "/company/edit",
  isProfessional,
  professionalController.editCompany
);

router.post(
  "/company/edit",
  isProfessional,
  professionalController.updateCompany
);

module.exports = router;