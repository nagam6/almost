import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    tagline: {
      type: String,
      required: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    symbol: {
      type: String,
      required: true,
      maxlength: 20,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema);