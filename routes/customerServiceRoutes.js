const express = require("express");
const router = express.Router();

const Service = require("../models/service");
const Review = require("../models/review");
const Settings = require("../models/settings");

const {
  validateSlug,
} = require("../utils/validators");

// ===============================
// SHOW ALL SERVICES
// ===============================
router.get("/", async (req, res) => {
  try {
    const services = await Service.find()
      .populate("company")
      .populate("professional");

    res.render("customer/services", {
      services,
    });
  } catch (error) {
    console.log("CUSTOMER SERVICES ERROR:", error);

    req.error("Unable to load services right now.");
    res.redirect("/");
  }
});

// ===============================
// VIEW SINGLE SERVICE
// WITH REVIEW PAGINATION
// ===============================

router.get("/:slug", async (req, res) => {
  try {
    console.log("REQUESTED SLUG:", req.params.slug);

    // ==========================================
    // VALIDATE SERVICE SLUG
    // ==========================================

    const slugError = validateSlug(req.params.slug);

    if (slugError) {
      req.error("Invalid service.");
      return res.redirect("/services");
    }

    // ==========================================
    // FIND SERVICE
    // ==========================================

    const service = await Service.findOne({
      slug: req.params.slug,
    })
      .populate("professional")
      .populate("company");

    if (!service) {
      req.flash("error", "Service not found.");
      return res.redirect("/services");
    }

    // ==========================================
    // REVIEW PAGINATION
    // ==========================================

    // Current page
    let page = 1;

    if (req.query.page !== undefined) {
      const pageValue = String(req.query.page).trim();

      // Page must contain only digits
      if (!/^\d+$/.test(pageValue)) {
        req.error("Invalid review page.");
        return res.redirect(`/services/${service.slug}`);
      }

      page = Number(pageValue);

      // Page must be a positive integer
      if (!Number.isInteger(page) || page < 1) {
        req.error("Invalid review page.");
        return res.redirect(`/services/${service.slug}`);
      }
    }

    // Reviews per page
    const limit = 6;

    // ==========================================
    // TOTAL REVIEW COUNT
    // ==========================================

    const reviewCount = await Review.countDocuments({
      service: service._id,
    });

    // ==========================================
    // TOTAL NUMBER OF PAGES
    // ==========================================

    const totalPages = Math.ceil(reviewCount / limit);

    // ==========================================
    // PREVENT PAGE FROM GOING BEYOND LAST PAGE
    // ==========================================

    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    // ==========================================
    // CALCULATE SKIP
    // ==========================================

    const skip = (page - 1) * limit;

    // ==========================================
    // GET REVIEWS FOR CURRENT PAGE
    // ==========================================

    const reviews = await Review.find({
      service: service._id,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ==========================================
    // CALCULATE AVERAGE RATING
    // IMPORTANT:
    // This uses ALL reviews, not only current page
    // ==========================================

    const allReviews = await Review.find({
      service: service._id,
    }).select("rating");

    let averageRating = 0;

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );

      averageRating = totalRating / allReviews.length;
    }

    // ==========================================
    // GET ADMIN SETTINGS
    // ==========================================

    const settings = await Settings.findOne();

    // ==========================================
    // RENDER SERVICE DETAILS
    // ==========================================

    res.render("customer/serviceDetails", {
      service,
      reviews,
      reviewCount,
      averageRating,
      settings,
      pageTitle: service.name,

      // Pagination data
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.log("SERVICE DETAILS ERROR:", error);

    req.flash("error", "Unable to load service details.");

    res.redirect("/services");
  }
});

module.exports = router;