import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    exhibit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exhibit",
      required: true,
      immutable: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    decision: {
      type: String,
      enum: ["approved", "rejected"],
      required: true,
      immutable: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      immutable: true,
      required: function () {
        return this.decision === "rejected";
      },
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ exhibit: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);