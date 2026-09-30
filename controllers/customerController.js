const User = require("../models/user");

const {
  validateName,
  validateEmail,
  validateMobile,
  validateAddress,
  validateLocation,
} = require("../utils/validators");

// ==========================================
// CUSTOMER DASHBOARD
// ==========================================

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.error("Customer account not found.");
      return res.redirect("/login");
    }

    res.render("customer/dashboard", {
      currentUser: user,
      pageTitle: "Customer Dashboard | Nirnay",
    });
  } catch (error) {
    console.log("CUSTOMER DASHBOARD ERROR:", error);

    req.error("Unable to load your dashboard.");
    return res.redirect("/login");
  }
};

// ==========================================
// CUSTOMER PROFILE
// ==========================================

exports.profile = async (req, res) => {
  try {
    console.log("SESSION:", req.session);
    console.log("USER ID:", req.session.userId);

    const user = await User.findById(req.session.userId);

    console.log("FOUND USER:", user);

    if (!user) {
      req.error("Customer profile not found.");
      return res.redirect("/login");
    }

    res.render("customer/profile", {
      user,
    });
  } catch (error) {
    console.log("CUSTOMER PROFILE ERROR:", error);

    req.error("Unable to load your profile.");
    return res.redirect("/customer/dashboard");
  }
};

// ==========================================
// EDIT CUSTOMER PROFILE PAGE
// ==========================================

exports.editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.error("Customer profile not found.");
      return res.redirect("/login");
    }

    res.render("customer/edit-profile", {
      user,
    });
  } catch (error) {
    console.log("EDIT CUSTOMER PROFILE ERROR:", error);

    req.error("Unable to open profile editing.");
    return res.redirect("/customer/profile");
  }
};

// ==========================================
// UPDATE CUSTOMER PROFILE
// ==========================================

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, address, location } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    const nameError = validateName(name);

    if (nameError) {
      req.error(nameError);
      return res.redirect("/customer/profile/edit");
    }

    const emailError = validateEmail(email);

    if (emailError) {
      req.error(emailError);
      return res.redirect("/customer/profile/edit");
    }

    const mobileError = validateMobile(mobile);

    if (mobileError) {
      req.error(mobileError);
      return res.redirect("/customer/profile/edit");
    }

    const addressError = validateAddress(address);

    if (addressError) {
      req.error(addressError);
      return res.redirect("/customer/profile/edit");
    }

    const locationError = validateLocation(location);

    if (locationError) {
      req.error(locationError);
      return res.redirect("/customer/profile/edit");
    }

    // ==========================================
    // FIND CURRENT CUSTOMER
    // ==========================================

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.error("Customer profile not found.");
      return res.redirect("/login");
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.session.userId },
    });

    if (existingUser) {
      req.error("This email is already registered with another account.");

      return res.redirect("/customer/profile/edit");
    }

    // ==========================================
    // UPDATE CUSTOMER INFORMATION
    // ==========================================

    user.name = name.trim();
    user.email = normalizedEmail;
    user.mobile = mobile.trim();
    user.address = address.trim();
    user.location = location ? location.trim() : "";

    // ==========================================
    // SAVE
    // ==========================================

    await user.save();

    req.success("Profile updated successfully!");

    return res.redirect("/customer/profile");
  } catch (error) {
    console.log("UPDATE CUSTOMER PROFILE ERROR:", error);

    // ==========================================
    // DUPLICATE EMAIL SAFETY
    // ==========================================

    if (error.code === 11000) {
      req.error("This email is already registered with another account.");

      return res.redirect("/customer/profile/edit");
    }

    req.error("Unable to update your profile.");

    return res.redirect("/customer/profile/edit");
  }
};
