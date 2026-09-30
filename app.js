const express = require("express");

const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();
const port = 3000;

const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();

// ========================================
// MODELS
// ========================================

const User = require("./models/user");

// ========================================
// ROUTES
// ========================================

const consultancyRoutes = require("./routes/consultancy");
const professionalRoutes = require("./routes/professionalRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const customerServiceRoutes = require("./routes/customerServiceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const professionalBookingRoutes = require("./routes/professionalBookingRoutes");
const customerRoutes = require("./routes/customer");
const accountRoutes = require("./routes/account");
const searchRoutes = require("./routes/search");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const companyRoutes = require("./routes/companyRoutes");

// ========================================
// EJS CONFIGURATION
// ========================================




app.engine("ejs", (filePath, options, callback) => {
    options.settings = options.settings || {};
    options.settings.views = options.settings.views || app.get("views");

    ejsMate(filePath, options, callback);
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

console.log("EJS VIEWS PATH:", app.get("views"));


// ========================================
// STATIC FILES
// ========================================

app.use(express.static(path.join(__dirname, "public")));

// ========================================
// FORM DATA
// ========================================

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ========================================
// SESSION
// ========================================

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// ========================================
// CURRENT USER
// ========================================

app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);

      if (user) {
        res.locals.currentUser = user;
      }
    } catch (error) {
      console.log("CURRENT USER ERROR:", error);
    }
  }

  next();
});

// ========================================
// FLASH MESSAGES
// ========================================

app.use(flash());

const { successMsg, errorMsg } = require("./middleware/messages");

app.use(successMsg);
app.use(errorMsg);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

// ========================================
// SESSION USER DATA
// ========================================

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.role = req.session.role;

  next();
});

// ========================================
// DEFAULT PAGE TITLE
// ========================================

app.use((req, res, next) => {
  res.locals.pageTitle = "Nirnay";

  next();
});

// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("MongoDB connected successfully");

    console.log("Database:", mongoose.connection.name);
  })

  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// ========================================
// AUTHENTICATION ROUTES
// ========================================

app.use("/", authRoutes);

// ========================================
// CONSULTANCY ROUTES
// ========================================

app.use("/consultancy", consultancyRoutes);

// ========================================
// PROFESSIONAL SERVICE ROUTES
// ========================================

// Example:
// /professional/services/create

app.use("/professional/services", serviceRoutes);

// ========================================
// PROFESSIONAL BOOKING ROUTES
// ========================================

// Example:
// /professional/bookings

app.use("/professional", professionalBookingRoutes);

// ========================================
// PROFESSIONAL ROUTES
// ========================================

// IMPORTANT:
// This comes AFTER professional booking routes
// because professionalRoutes contains "/:slug"

app.use("/professional", professionalRoutes);

// ==============================================
// COMPANY ROUTES
// ==============================================
app.use("/company", companyRoutes);

// ========================================
// CUSTOMER SERVICE ROUTES
// ========================================

// Example:
// /services/website-development

app.use("/services", customerServiceRoutes);

// ========================================
// ADMIN ROUTES
// ========================================

app.use("/admin", adminRoutes);

// ========================================
// CUSTOMER ROUTES
// ========================================

// Example:
// /customer/bookings

app.use("/customer", bookingRoutes);

app.use("/customer", customerRoutes);

// ========================================
// ACCOUNT ROUTES
// ========================================

app.use("/account", accountRoutes);

// ========================================
// SEARCH ROUTES
// ========================================

app.use("/search", searchRoutes);

// ========================================
// REVIEW ROUTES
// ========================================

app.use("/review", reviewRoutes);

// ========================================
// GENERAL PAGES
// ========================================

// HOME

app.get("/", (req, res) => {
  res.render("index", {
    pageTitle: "Nirnay | Expert Guidance. Better Decisions.",
  });
});

// ABOUT

app.get("/about", (req, res) => {
  res.render("about", {
    pageTitle: "About Us | Nirnay",
  });
});

// CONTACT

app.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact Us | Nirnay",
  });
});

// ========================================
// CUSTOMER DASHBOARD
// ========================================

app.get("/customer/dashboard", (req, res) => {
  res.render("customer/dashboard", {
    pageTitle: "Customer Dashboard | Nirnay",
  });
});

// ========================================
// SERVER
// ========================================

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
