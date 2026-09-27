import { Router } from "express";
import Exhibit from "../models/Exhibit.js";

const router = Router();

router.get("/:slug", async (request, response) => {
  try {
    const exhibit = await Exhibit.findOne({
      slug: request.params.slug,
      status: "published",
    })
      .select(
        "slug roomSlug number topic title question incorrectAnswer options -_id"
      )
      .lean();

    if (!exhibit) {
      return response.status(404).json({
        message: "Exhibit not found.",
      });
    }

    response.json({ exhibit });
  } catch {
    response.status(500).json({
      message: "Unable to load exhibit.",
    });
  }
});

export default router;