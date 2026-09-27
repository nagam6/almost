import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const exhibitSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      immutable: true,
      validate: {
        validator: Number.isInteger,
        message: "Exhibit version must be an integer.",
      },
    },

    roomSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    number: {
      type: Number,
      required: true,
      min: 1,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    incorrectAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [optionSchema],
      required: true,
      validate: [
        {
          validator: (options) => options.length >= 2,
          message: "Provide at least two answer options.",
        },
        {
          validator: (options) =>
            new Set(options.map((option) => option.id)).size ===
            options.length,
          message: "Answer option IDs must be unique.",
        },
      ],
    },

    correctOptionId: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (value) {
          return this.options.some((option) => option.id === value);
        },
        message: "The correct answer must match an existing option.",
      },
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

// Supports the published exhibits query for each room.
exhibitSchema.index({
  roomSlug: 1,
  status: 1,
  number: 1,
  slug: 1,
});

export default mongoose.model("Exhibit", exhibitSchema);