const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");
const isLoggedIn = require("../middleware/isLoggedIn");

// PROFILE
router.get(
    "/profile",
    isLoggedIn,
    accountController.profile,
);

// CHANGE PASSWORD
router.get(
    "/change-password",
    isLoggedIn,
    accountController.changePasswordPage
);

router.post(
    "/change-password",
    isLoggedIn,
    accountController.changePassword
);

module.exports = router;