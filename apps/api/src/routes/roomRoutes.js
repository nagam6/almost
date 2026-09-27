import { Router } from "express";
import Room from "../models/Room.js";

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

export default router;