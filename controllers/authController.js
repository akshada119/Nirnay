const bcrypt = require("bcrypt");
const User = require("../models/user");
const Settings = require("../models/settings");

const {
  validateName,
  validateEmail,
  validateMobile,
  validatePassword,
  validateAddress,
  validateConsultancy,
  validateExperience,
} = require("../utils/validators");

// ===============================
// SHOW LOGIN PAGE
// ===============================

exports.showLogin = (req, res) => {
  res.render("login");
};

// ===============================
// LOGIN USER
// ===============================

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===============================
    // LOGIN VALIDATION
    // ===============================

    const emailError = validateEmail(email);

    if (emailError) {
      req.error(emailError);
      return res.redirect("/login");
    }

    if (!password || password.trim() === "") {
      req.error("Password is required.");
      return res.redirect("/login");
    }

    // ===============================
    // FIND USER
    // ===============================

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    console.log("LOGIN EMAIL:", email);
    console.log("USER FOUND:", user ? "YES" : "NO");

    if (user) {
      console.log("USER ROLE:", user.role);
      console.log("USER ID:", user._id);
    }

    if (!user) {
      req.error("Invalid email or password.");
      return res.redirect("/login");
    }

    // ===============================
    // CHECK ACCOUNT STATUS
    // ===============================

    if (user.accountStatus !== "active") {
      req.error("Your account is currently inactive or suspended.");
      return res.redirect("/login");
    }

    // ===============================
    // COMPARE PASSWORD
    // ===============================

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.error("Invalid email or password.");
      return res.redirect("/login");
    }

    // ===============================
    // CREATE SESSION
    // ===============================

    req.session.userId = user._id;
    req.session.role = user.role;

    const returnTo = req.session.returnTo;
    delete req.session.returnTo;

    console.log("LOGIN USER ID:", req.session.userId);
    console.log("LOGIN ROLE:", req.session.role);
    console.log("Login successful:", user.email);

    // ===============================
    // REDIRECT ACCORDING TO ROLE
    // ===============================

    if (user.role === "customer") {
      req.success("Login successful!");

      if (returnTo && returnTo.startsWith("/")) {
        return res.redirect(returnTo);
      }

      return res.redirect("/customer/dashboard");
    }

    if (user.role === "admin") {
      req.success("Admin login successful!");

      return res.redirect("/admin/dashboard");
    }

    if (user.role === "professional") {
      req.success("Login successful!");

      return res.redirect("/professional/dashboard");
    }

    req.error("Invalid user role.");

    return res.redirect("/login");
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    req.error("Login failed. Please try again.");

    return res.redirect("/login");
  }
};

// ===============================
// SHOW REGISTER PAGE
// ===============================

exports.showRegister = (req, res) => {
  res.render("register");
};

// ===============================
// REGISTER USER
// ===============================

exports.registerUser = async (req, res) => {
  try {
    // ===============================
    // CHECK SETTINGS
    // ===============================

    const settings = await Settings.findOne();

    // ===============================
    // CHECK CUSTOMER REGISTRATION
    // ===============================

    if (
      settings &&
      settings.allowCustomerRegistration === false &&
      req.body.role !== "professional"
    ) {
      req.error("Customer registration is currently disabled.");

      return res.redirect("/register");
    }

    // ===============================
    // CHECK PROFESSIONAL REGISTRATION
    // ===============================

    if (
      settings &&
      settings.allowProfessionalRegistration === false &&
      req.body.role === "professional"
    ) {
      req.error("Professional registration is currently disabled.");

      return res.redirect("/register");
    }

    console.log("FORM DATA:");
    console.log(req.body);

    const {
      name,
      email,
      password,
      mobile,
      address,
      role,
      consultancy,
      experience,
    } = req.body;

    // ===============================
    // NAME VALIDATION
    // ===============================

    const nameError = validateName(name);

    if (nameError) {
      req.error(nameError);
      return res.redirect("/register");
    }

    // ===============================
    // EMAIL VALIDATION
    // ===============================

    const emailError = validateEmail(email);

    if (emailError) {
      req.error(emailError);
      return res.redirect("/register");
    }

    // ===============================
    // MOBILE VALIDATION
    // ===============================

    const mobileError = validateMobile(mobile);

    if (mobileError) {
      req.error(mobileError);
      return res.redirect("/register");
    }

    // ===============================
    // PASSWORD VALIDATION
    // ===============================

    const passwordError = validatePassword(password);

    if (passwordError) {
      req.error(passwordError);
      return res.redirect("/register");
    }

    // ===============================
    // ADDRESS VALIDATION
    // ===============================

    const addressError = validateAddress(address);

    if (addressError) {
      req.error(addressError);
      return res.redirect("/register");
    }

    // ===============================
    // ROLE VALIDATION
    // ===============================

    // Public registration can NEVER create an admin.
    if (!["customer", "professional"].includes(role)) {
      req.error("Invalid registration role.");
      return res.redirect("/register");
    }

    // ===============================
    // PROFESSIONAL VALIDATION
    // ===============================

    if (role === "professional") {
      const consultancyError = validateConsultancy(consultancy);

      if (consultancyError) {
        req.error(consultancyError);
        return res.redirect("/register");
      }

      const experienceError = validateExperience(experience);

      if (experienceError) {
        req.error(experienceError);
        return res.redirect("/register");
      }
    }

    // ===============================
    // CHECK EMAIL
    // ===============================

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      req.error("Email already registered. Please login.");

      return res.redirect("/register");
    }

    // ===============================
    // HASH PASSWORD
    // ===============================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ===============================
    // CREATE USER
    // ===============================

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: mobile.trim(),
      address: address.trim(),

      role: role,

      consultancy: role === "professional" ? consultancy?.trim() : undefined,

      experience: role === "professional" ? experience?.trim() : undefined,
    });

    // ===============================
    // SAVE USER
    // ===============================

    await newUser.save();

    // ===============================
    // AUTO LOGIN
    // ===============================

    req.session.userId = newUser._id;
    req.session.role = newUser.role;

    console.log("REGISTERED USER ID:", req.session.userId);
    console.log("REGISTERED ROLE:", req.session.role);
    console.log("Auto login successful:", newUser.email);

    // ===============================
    // REDIRECT ACCORDING TO ROLE
    // ===============================

    if (newUser.role === "customer") {
      req.success("Registration successful!");

      return res.redirect("/customer/dashboard");
    }

    if (newUser.role === "professional") {
      req.success("Registration successful!");

      return res.redirect("/professional/dashboard");
    }

    req.error("Invalid user role.");

    return res.redirect("/login");
  } catch (error) {
    console.log("ERROR WHILE REGISTERING:");
    console.log(error);

    // ===============================
    // DUPLICATE EMAIL SAFETY
    // ===============================

    if (error.code === 11000) {
      req.error("Email already registered. Please login.");
      return res.redirect("/register");
    }

    req.error("Registration failed. Please try again.");

    return res.redirect("/register");
  }
};

// ===============================
// LOGOUT USER
// ===============================

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);

      req.success("Logged out successfully");

      return res.redirect("/");
    }

    res.clearCookie("connect.sid");

    return res.redirect("/login");
  });
};
