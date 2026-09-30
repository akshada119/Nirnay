const express = require("express");

const router = express.Router();

const isLoggedIn = require("../middleware/isLoggedIn");

const authController = require("../controllers/authController");

// ================================
// LOGIN
// ================================

router.get("/login", authController.showLogin);

router.post("/login", authController.loginUser);

// ================================
// REGISTER
// ================================

router.get("/register", authController.showRegister);

router.post("/register", authController.registerUser);

// ================================
// LOGOUT
// ================================

router.get("/logout", authController.logoutUser);

module.exports = router;