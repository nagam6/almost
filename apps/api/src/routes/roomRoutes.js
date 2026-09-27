import { Router } from "express";
import Room from "../models/Room.js";
import Exhibit from "../models/Exhibit.js";
const router = Router();

router.get("/", async (_request, response) => {
  try {
    const rooms = await Room.find()
      .select("slug name tagline description symbol order -_id")
      .sort({ order: 1, slug: 1 })
      .lean();

    response.json({ rooms });
  } catch {
    response.status(500).json({
      message: "Unable to load museum rooms.",
    });
  }
});

router.get("/:roomSlug/exhibits", async (request, response) => {
  try {
    const { roomSlug } = request.params;

    const room = await Room.findOne({ slug: roomSlug })
      .select("slug name tagline description symbol -_id")
      .lean();

    if (!room) {
      return response.status(404).json({
        message: "Room not found.",
      });
    }

    const exhibits = await Exhibit.find({
      roomSlug,
      status: "published",
    })
      .select(
        "slug roomSlug number topic title question incorrectAnswer -_id"
      )
      .sort({ number: 1, slug: 1 })
      .lean();

    response.json({ room, exhibits });
  } catch {
    response.status(500).json({
      message: "Unable to load room exhibits.",
    });
  }
});

export default router;