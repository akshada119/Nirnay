const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    // ========================================
    // ACCOUNT ROLE
    // ========================================

    role: {
      type: String,
      enum: ["customer", "professional", "admin"],
      default: "customer",
    },

    // ========================================
    // PROFESSIONAL INFORMATION
    // ========================================

    consultancy: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    skills: {
      type: String,
      trim: true,
    },

    professionalDescription: {
      type: String,
      trim: true,
    },

    about: {
      type: String,
      trim: true,
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// slug for proff
userSchema.pre("validate", function (next) {

    if (
        this.role === "professional" &&
        (this.isModified("name") || !this.slug)
    ) {

        const baseSlug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        this.slug = `${baseSlug}-${this._id
            .toString()
            .slice(-6)}`;
    }

    next();

});

const User = mongoose.model("User", userSchema);

module.exports = User;
