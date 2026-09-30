const mongoose = require("mongoose");
const slugify = require("slugify");
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    website: {
      type: String,
    },

    officeHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },

      tuesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },

      wednesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },

      thursday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },

      friday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" },
      },

      saturday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "14:00" },
      },

      sunday: {
        isOpen: { type: Boolean, default: false },
        open: { type: String, default: null },
        close: { type: String, default: null },
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

companySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  next();
});

module.exports = mongoose.model("Company", companySchema);
