import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { connectDB } from "../config/db.js";
import Exhibit from "../models/Exhibit.js";
import Attempt from "../models/Attempt.js";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

async function setupAttemptIndexes() {
  try {
    await connectDB();

       const result = await Exhibit.collection.updateMany(
      { version: { $exists: false } },
      { $set: { version: 1 } }
    );

    await Exhibit.createIndexes();
    await Attempt.createIndexes();

    console.log(
      `Exhibit versions added: ${result.modifiedCount}.`
    );
    console.log("Exhibit and attempt indexes ready.");
  } catch (error) {
    console.error("Database setup failed:", {
      name: error.name,
      code: error.code,
    });

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setupAttemptIndexes();