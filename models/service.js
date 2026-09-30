const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    // =====================================
    // SERVICE BASIC INFORMATION
    // =====================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    priorityImage: {
      url: String,
      public_id: String,
    },
    
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // SERVICE OWNER
    // =====================================

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================
    // BOOKING AVAILABILITY
    // =====================================

    isBookingAvailable: {
      type: Boolean,
      default: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
