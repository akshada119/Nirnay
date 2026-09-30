const express = require("express");

const router = express.Router();

const isLoggedIn = require("../middleware/isLoggedIn");

const customerController = require("../controllers/customerController");

const isCustomer = require("../middleware/authMiddleware");

// ========================================
// CUSTOMER PROFILE
// ========================================

router.get("/profile", isLoggedIn, isCustomer, customerController.profile);

// ========================================
// EDIT PROFILE
// ========================================

router.get(
  "/profile/edit",
  isLoggedIn,
  isCustomer,
  customerController.editProfile,
);

router.post(
  "/profile/edit",
  isLoggedIn,
  isCustomer,
  customerController.updateProfile,
);

module.exports = router;
