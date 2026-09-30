const express = require("express");

const router = express.Router();

const Company = require("../models/company");
const Service = require("../models/service");

const { validateSlug } = require("../utils/validators");

// ========================================
// COMPANY DETAILS USING SLUG
// ========================================

router.get("/:slug", async (req, res) => {
  try {
    // Validate company slug
    const slugError = validateSlug(req.params.slug);

    if (slugError) {
      req.error("Invalid company.");
      return res.redirect("/services");
    }

    const company = await Company.findOne({
      slug: req.params.slug,
    }).populate("owner");

    if (!company) {
      req.error("Company not found.");
      return res.redirect("/services");
    }

    const services = await Service.find({
      company: company._id,
    }).populate("professional");

    res.render("company/companyDetails", {
      company,
      services,
      pageTitle: `${company.name} | Nirnay`,
    });
  } catch (error) {
    console.log("COMPANY DETAILS ERROR:", error);

    req.error("Unable to load company details.");
    res.redirect("/services");
  }
});

module.exports = router;
