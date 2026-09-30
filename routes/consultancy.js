const express = require("express");
const router = express.Router();
const Service = require("../models/service");
const { getOfficeStatus } = require("../utils/officeHours");
const Review = require("../models/review");

const { validateSlug } = require("../utils/validators");

const categories = {
  it: {
    name: "IT Consultancy",
    icon: "fa-laptop-code",
    description:
      "Connect with experienced IT professionals for technology, software, cloud, and digital solutions.",
  },

  finance: {
    name: "Finance Consultancy",
    icon: "fa-chart-line",
    description:
      "Get professional guidance for financial planning, investment, accounting, and business finance.",
  },

  healthcare: {
    name: "Healthcare Consultancy",
    icon: "fa-heart-pulse",
    description:
      "Find healthcare professionals who can provide expert guidance and support.",
  },

  education: {
    name: "Education Consultancy",
    icon: "fa-graduation-cap",
    description:
      "Get guidance for education, courses, admissions, skills, and academic planning.",
  },

  research: {
    name: "Research Consultancy",
    icon: "fa-flask",
    description:
      "Connect with research professionals for academic, technical, and industry research.",
  },

  business: {
    name: "Business Consultancy",
    icon: "fa-briefcase",
    description:
      "Get expert business guidance for strategy, operations, growth, and performance.",
  },

  hr: {
    name: "HR Consultancy",
    icon: "fa-users",
    description:
      "Get professional support for recruitment, employee management, and HR strategy.",
  },

  legal: {
    name: "Legal Consultancy",
    icon: "fa-scale-balanced",
    description:
      "Connect with professionals for legal guidance and business-related legal support.",
  },

  agriculture: {
    name: "Agriculture Consultancy",
    icon: "fa-seedling",
    description:
      "Get expert agricultural guidance for farming, crops, technology, and business.",
  },

  manufacturing: {
    name: "Manufacturing Consultancy",
    icon: "fa-industry",
    description:
      "Improve manufacturing processes, productivity, quality, and operational efficiency.",
  },

  realEstate: {
    name: "Real Estate Consultancy",
    icon: "fa-building",
    description:
      "Get professional guidance for property, real estate investment, and development.",
  },

  marketing: {
    name: "Marketing Consultancy",
    icon: "fa-bullhorn",
    description:
      "Build stronger brands and grow your business through effective marketing strategies.",
  },

  career: {
    name: "Career Consultancy",
    icon: "fa-user-tie",
    description:
      "Get personalized career guidance for skills, jobs, interviews, and professional growth.",
  },

  environmental: {
    name: "Environmental Consultancy",
    icon: "fa-leaf",
    description:
      "Get professional guidance for sustainability, environmental management, and compliance.",
  },

  engineering: {
    name: "Engineering Consultancy",
    icon: "fa-gears",
    description:
      "Connect with engineering professionals for technical and project-related solutions.",
  },
};

// Dynamic category route
router.get("/:category", async (req, res) => {
  try {
    // ========================================
    // VALIDATE CATEGORY
    // ========================================

    const categoryError = validateSlug(req.params.category);

    if (categoryError) {
      req.error("Invalid consultancy category.");
      return res.redirect("/consultancy");
    }

    const categoryKey = req.params.category;

    // Check whether category exists
    const category = categories[categoryKey];

    if (!category) {
      req.error("Consultancy category not found.");
      return res.redirect("/consultancy");
    }

    // Find services belonging to this category
    const services = await Service.find({
      category: categoryKey,
    })
      .populate("company")
      .populate("professional")
      .sort({ createdAt: -1 });

    // =========================================================
    // GET REVIEW SUMMARY FOR ALL SERVICES
    // =========================================================

    const serviceIds = services.map((service) => service._id);

    const reviewSummary = await Review.aggregate([
      {
        $match: {
          service: { $in: serviceIds },
        },
      },
      {
        $group: {
          _id: "$service",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // =========================================================
    // CREATE REVIEW LOOKUP
    // =========================================================

    const reviewMap = {};

    reviewSummary.forEach((item) => {
      reviewMap[item._id.toString()] = {
        reviewCount: item.reviewCount,
        averageRating: item.averageRating,
      };
    });

    // =========================================================
    // ADD REVIEWS + OFFICE STATUS TO EACH SERVICE
    // =========================================================

    services.forEach((service) => {
      // -------------------------
      // Review information
      // -------------------------

      const summary = reviewMap[service._id.toString()];

      if (summary) {
        service.reviewCount = summary.reviewCount;
        service.averageRating = summary.averageRating;
      } else {
        service.reviewCount = 0;
        service.averageRating = 0;
      }

      // -------------------------
      // Office hours status
      // -------------------------

      if (service.company && service.company.officeHours) {
        service.officeStatus = getOfficeStatus(service.company.officeHours);
      } else {
        service.officeStatus = {
          isOpen: false,
          message: "Hours not available",
        };
      }
    });

    // =========================================================
    // RENDER CATEGORY PAGE
    // =========================================================

    res.render("consultancy/category", {
      categoryKey,
      category,
      services,
    });
  } catch (error) {
    console.log("CONSULTANCY CATEGORY ERROR:", error);

    req.error("Unable to load consultancy services.");
    res.redirect("/consultancy");
  }
});

module.exports = router;
