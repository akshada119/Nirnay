const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // ==============================
    // PLATFORM SETTINGS
    // ==============================

    platformName: {
      type: String,
      default: "Nirnay",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "",
      trim: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    platformAddress: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // BOOKING SETTINGS
    // ==============================

    allowBookings: {
      type: Boolean,
      default: true,
    },

    defaultBookingStatus: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },

    allowCustomerCancellation: {
      type: Boolean,
      default: true,
    },

    // ==============================
    // USER SETTINGS
    // ==============================

    allowCustomerRegistration: {
      type: Boolean,
      default: true,
    },

    allowProfessionalRegistration: {
      type: Boolean,
      default: true,
    },

    requireProfessionalApproval: {
      type: Boolean,
      default: false,
    },
   
    cancellationLimitValue: {
      type: Number,
      default: 24,
      min: 1,
    },

    cancellationLimitUnit: {
      type: String,
      enum: ["hours", "days"],
      default: "hours",
    },
  },

  {
    timestamps: true,
  },
);

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
