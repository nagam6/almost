import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { connectDB } from "../config/db.js";
import Room from "../models/Room.js";

const rooms = [
  {
    slug: "math",
    name: "Math",
    tagline: "Numbers can fool you.",
    description:
      "Explore the small assumptions that lead to surprising answers.",
    symbol: "÷",
    order: 1,
  },
  {
    slug: "javascript",
    name: "JavaScript",
    tagline: "Almost working.",
    description:
      "Follow the code and find the moment it takes an unexpected turn.",
    symbol: "{ }",
    order: 2,
  },
];

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

async function seedRooms() {
  try {
    await connectDB();
    await Room.init();

    let added = 0;

    for (const room of rooms) {
      await new Room(room).validate();

      const result = await Room.updateOne(
        { slug: room.slug },
        { $setOnInsert: room },
        {
          upsert: true,
          runValidators: true,
        }
      );

      added += result.upsertedCount;
    }

    console.log(
      `Rooms ready. Added: ${added}. Already present: ${rooms.length - added}.`
    );
  } catch (error) {
    console.error("Room seed failed:", {
      name: error.name,
      code: error.code,
    });

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedRooms();