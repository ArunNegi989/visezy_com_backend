import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    highlightText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    remainingTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    primaryButtonText: {
      type: String,
      default: "Get Started",
    },

    primaryButtonLink: {
      type: String,
      default: "/contact-us",
    },

    secondaryButtonText: {
      type: String,
      default: "Employees Get Hired",
    },

    secondaryButtonLink: {
      type: String,
      default: "/employees",
    },

    features: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Maximum 5 features allowed.",
      },
    },

    image: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Slider", sliderSchema);