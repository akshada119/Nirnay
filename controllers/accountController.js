const User = require("../models/user");
const bcrypt = require("bcrypt");

const {
  validatePassword,
  validateConfirmPassword,
} = require("../utils/validators");

const getProfilePath = (role) => {
  if (role === "professional") return "/professional/profile";
  if (role === "customer") return "/customer/profile";
  return "/";
};

// ========================================
// PROFILE
// CUSTOMER + PROFESSIONAL
// ========================================

exports.profile = async (req, res) => {
  try {
    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.error("User profile not found.");

      return res.redirect("/");
    }

    return res.redirect(getProfilePath(user.role));
  } catch (error) {
    console.log("PROFILE ERROR:", error);

    req.error("Unable to load profile.");

    return res.redirect("/");
  }
};

// ========================================
// CHANGE PASSWORD PAGE
// ========================================

exports.changePasswordPage = async (req, res) => {
  try {
    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    res.render("account/change-password", {
      profilePath: getProfilePath(req.session.role),
    });
  } catch (error) {
    console.log("CHANGE PASSWORD PAGE ERROR:", error);

    req.error("Unable to open change password page.");

    return res.redirect("/account/profile");
  }
};

// ========================================
// CHANGE PASSWORD
// ========================================

exports.changePassword = async (req, res) => {
  try {
    if (!req.session.userId) {
      req.error("Please login first.");

      return res.redirect("/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

   // ========================================
// VALIDATION
// ========================================

if (!currentPassword || !newPassword || !confirmPassword) {
  req.error("Please complete all password fields.");
  return res.redirect("/account/change-password");
}

const passwordError = validatePassword(newPassword);

if (passwordError) {
  req.error(passwordError);
  return res.redirect("/account/change-password");
}

const confirmPasswordError = validateConfirmPassword(
  newPassword,
  confirmPassword
);

if (confirmPasswordError) {
  req.error(confirmPasswordError);
  return res.redirect("/account/change-password");
}
    const user = await User.findById(req.session.userId);

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      req.error("Current password is incorrect.");
      return res.redirect("/account/change-password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.success("Password changed successfully.");
    return res.redirect(getProfilePath(req.session.role));
  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);

    req.error("Unable to change password.");

    return res.redirect(getProfilePath(req.session.role));
  }
};
