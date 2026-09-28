import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
    exhibit: { type: mongoose.Schema.Types.ObjectId, ref: "Exhibit", required: true, immutable: true },
    exhibitVersion: {
      type: Number, required: true, min: 1, immutable: true,
      validate: { validator: Number.isInteger, message: "Exhibit version must be an integer." },
    },
    selectedOptionId: { type: String, required: true, trim: true, immutable: true },
    reasoning: { type: String, trim: true, maxlength: 1000, default: "", immutable: true },
    isCorrect: { type: Boolean, required: true, immutable: true },
    // Store the feedback used at submission, so later reads use the same result.
    correctOptionId: { type: String, required: true, immutable: true, select: false },
    correctOptionText: { type: String, required: true, immutable: true, select: false },
    explanation: { type: String, required: true, immutable: true, select: false },
    selectedOptionFeedback: { type: String, default: "", immutable: true, select: false },
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: false } }
);
attemptSchema.index({ user: 1, exhibit: 1, exhibitVersion: 1 }, { unique: true });
attemptSchema.index({ user: 1, submittedAt: -1 });
attemptSchema.index({ exhibit: 1, exhibitVersion: 1 });
export default mongoose.model("Attempt", attemptSchema);
