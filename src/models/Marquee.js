import mongoose from "mongoose";

const marqueeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    link: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Marquee = mongoose.model(
  "Marquee",
  marqueeSchema
);

export default Marquee;