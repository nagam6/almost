import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { connectDB } from "../config/db.js";
import Exhibit from "../models/Exhibit.js";
import Room from "../models/Room.js";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

const exhibits = [
  {
    slug: "math-percentages",
    roomSlug: "math",
    number: 1,
    topic: "Percentages",
    title: "Back to the original price?",
    question:
      "A bag costs $100. Its price drops by 20%, then increases by 20%. What is the final price?",
    incorrectAnswer: "$100, because the two percentages cancel out.",
    options: [
      { id: "same-amount", text: "Both changes are worth $20." },
      {
        id: "different-base",
        text: "The increase uses the discounted price as its base.",
      },
      {
        id: "reverse-order",
        text: "Reversing the changes would restore the original price.",
      },
    ],
    correctOptionId: "different-base",
    explanation:
      "After the discount, the price is $80. The increase is 20% of $80, which is $16. The final price is $96.",
    status: "published",
  },
  {
    slug: "math-fractions",
    roomSlug: "math",
    number: 2,
    topic: "Fractions",
    title: "Just add everything?",
    question: "What is 1/2 + 1/3?",
    incorrectAnswer: "2/5, by adding the numerators and denominators.",
    options: [
      {
        id: "common-denominator",
        text: "The fractions need a common denominator before adding.",
      },
      {
        id: "multiply-all",
        text: "Multiply both numerators and both denominators.",
      },
      {
        id: "larger-denominator",
        text: "Add the numerators and keep the larger denominator.",
      },
    ],
    correctOptionId: "common-denominator",
    explanation:
      "The pieces must have the same size. Convert 1/2 to 3/6 and 1/3 to 2/6. Their sum is 5/6.",
    status: "published",
  },
  {
    slug: "math-area",
    roomSlug: "math",
    number: 3,
    topic: "Geometry",
    title: "Twice as wide, twice as big?",
    question:
      "A square has a side length of 3 cm. Every side doubles to 6 cm. What is its new area?",
    incorrectAnswer: "18 cm², because the original area of 9 cm² doubles.",
    options: [
      {
        id: "one-dimension",
        text: "Only one dimension affects the area.",
      },
      {
        id: "both-dimensions",
        text: "Both dimensions double, so the area becomes four times larger.",
      },
      {
        id: "add-length",
        text: "Add the new side length to the original area.",
      },
    ],
    correctOptionId: "both-dimensions",
    explanation:
      "Area is side × side. The original area is 3 × 3 = 9 cm². The new area is 6 × 6 = 36 cm².",
    status: "published",
  },
  {
    slug: "js-addition",
    roomSlug: "javascript",
    number: 4,
    topic: "Type conversion",
    title: "When two becomes twenty-two",
    question: 'What does console.log("2" + 2) print?',
    incorrectAnswer: "4, because 2 + 2 = 4.",
    options: [
      {
        id: "automatic-number",
        text: "JavaScript always converts strings to numbers when using +.",
      },
      {
        id: "string-concatenation",
        text: "The string causes + to join the two values as text.",
      },
      {
        id: "syntax-error",
        text: "Combining a string and a number causes a syntax error.",
      },
    ],
    correctOptionId: "string-concatenation",
    explanation:
      'With "2" + 2, JavaScript converts the number to text and joins the values. The result is the string "22".',
    status: "published",
  },
  {
    slug: "js-comparison",
    roomSlug: "javascript",
    number: 5,
    topic: "Comparisons",
    title: "Same contents, same array?",
    question: "What does console.log([] === []) print?",
    incorrectAnswer: "true, because both arrays are empty.",
    options: [
      {
        id: "compare-length",
        text: "Strict equality compares array lengths.",
      },
      {
        id: "empty-invalid",
        text: "Empty arrays cannot be compared.",
      },
      {
        id: "different-references",
        text: "These are two different array objects.",
      },
    ],
    correctOptionId: "different-references",
    explanation:
      "Strict equality compares object identity. Each [] creates a separate array, so the result is false, even though their contents match.",
    status: "published",
  },
  {
    slug: "js-loops",
    roomSlug: "javascript",
    number: 6,
    topic: "Loops",
    title: "One step too far",
    question:
      'How many times does this loop run?\n\nconst items = ["a", "b", "c"];\nfor (let i = 0; i <= items.length; i++) {\n  console.log(items[i]);\n}',
    incorrectAnswer: "3 times, once for each item.",
    options: [
      {
        id: "inclusive-boundary",
        text: "The <= condition also allows i to equal the array length.",
      },
      {
        id: "starts-at-one",
        text: "JavaScript array indexes start at 1.",
      },
      {
        id: "length-changes",
        text: "Reading an item changes the array length.",
      },
    ],
    correctOptionId: "inclusive-boundary",
    explanation:
      "The loop runs for indexes 0, 1, 2, and 3: four times. Index 3 returns undefined. Use i < items.length to visit only the three items.",
    status: "published",
  },
];

async function seedExhibits() {
  try {
    await connectDB();
    await Exhibit.init();

    // Check every record before inserting any data.
    const rooms = await Room.find().select("slug").lean();
    const roomSlugs = new Set(rooms.map((room) => room.slug));

    for (const exhibit of exhibits) {
      if (!roomSlugs.has(exhibit.roomSlug)) {
        throw new Error(`Missing room: ${exhibit.roomSlug}`);
      }

      await new Exhibit(exhibit).validate();
    }

    let added = 0;

    for (const exhibit of exhibits) {
      const result = await Exhibit.updateOne(
        { slug: exhibit.slug },
        { $setOnInsert: exhibit },
        { upsert: true }
      );

      added += result.upsertedCount;
    }

    console.log(
      `Exhibits ready. Added: ${added}. Already present: ${
        exhibits.length - added
      }.`
    );
  } catch (error) {
    console.error("Exhibit seed failed:", error.name);

    if (error.name === "ValidationError") {
      for (const issue of Object.values(error.errors)) {
        console.error(`${issue.path}: ${issue.message}`);
      }
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedExhibits();