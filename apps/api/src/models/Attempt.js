import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    exhibit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exhibit",
      required: true,
      immutable: true,
    },

    exhibitVersion: {
      type: Number,
      required: true,
      min: 1,
      immutable: true,
      validate: {
        validator: Number.isInteger,
        message: "Exhibit version must be an integer.",
      },
    },

    selectedOptionId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },

    reasoning: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
      immutable: true,
    },

    isCorrect: {
      type: Boolean,
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: {
      createdAt: "submittedAt",
      updatedAt: false,
    },
  }
);

// One first attempt per learner and exhibit version.
attemptSchema.index(
  { user: 1, exhibit: 1, exhibitVersion: 1 },
  { unique: true }
);

// Retrieve a learner's most recent attempts.
attemptSchema.index({ user: 1, submittedAt: -1 });

// Retrieve attempts for a specific exhibit version.
attemptSchema.index({ exhibit: 1, exhibitVersion: 1 });

export default mongoose.model("Attempt", attemptSchema);