
const Service = require("../models/service");
const Company = require("../models/company");
const User = require("../models/user");

const {
  isEmpty,
} = require("../utils/validators");

// ==========================================
// SEARCH SERVICES
// ==========================================

exports.searchServices = async (req, res) => {
  try {
    // ------------------------------------------
    // GET SEARCH QUERY
    // ------------------------------------------

    const query =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

    // ------------------------------------------
    // VALIDATE EMPTY SEARCH
    // ------------------------------------------

    if (isEmpty(query)) {
      req.error("Please enter something to search.");

      return res.redirect("/services");
    }

    // ------------------------------------------
    // VALIDATE SEARCH LENGTH
    // ------------------------------------------

    if (query.length < 2) {
      req.error(
        "Search must contain at least 2 characters.",
      );

      return res.redirect("/services");
    }

    if (query.length > 100) {
      req.error(
        "Search query cannot exceed 100 characters.",
      );

      return res.redirect("/services");
    }

    // ------------------------------------------
    // ESCAPE REGEX SPECIAL CHARACTERS
    // ------------------------------------------

    const escapedQuery = query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const searchRegex = new RegExp(
      escapedQuery,
      "i",
    );

    // ==========================================
    // 1. SEARCH PROFESSIONALS
    // ==========================================

    const professionals = await User.find({
      role: "professional",
      name: searchRegex,
    }).select("_id");

    const professionalIds = professionals.map(
      (professional) => professional._id,
    );

    // ==========================================
    // 2. SEARCH COMPANIES
    // ==========================================

    const companies = await Company.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
      ],
    }).select("_id");

    const companyIds = companies.map(
      (company) => company._id,
    );

    // ==========================================
    // 3. SEARCH SERVICES
    // ==========================================

    const services = await Service.find({
      $or: [
        // Service name
        {
          name: searchRegex,
        },

        // Service category
        {
          category: searchRegex,
        },

        // Service description
        {
          description: searchRegex,
        },

        // Professional
        {
          professional: {
            $in: professionalIds,
          },
        },

        // Company
        {
          company: {
            $in: companyIds,
          },
        },
      ],
    })
      .populate("company")
      .populate("professional")
      .sort({
        createdAt: -1,
      });

    // ==========================================
    // 4. RENDER SEARCH RESULTS
    // ==========================================

    return res.render("search", {
      services,
      query,
    });
  } catch (error) {
    console.error(
      "SEARCH ERROR:",
      error,
    );

    // ------------------------------------------
    // MONGOOSE VALIDATION ERROR
    // ------------------------------------------

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      req.error(message);

      return res.redirect("/services");
    }

    // ------------------------------------------
    // GENERAL ERROR
    // ------------------------------------------

    req.error(
      "Unable to perform search. Please try again.",
    );

    return res.redirect("/services");
  }
};

