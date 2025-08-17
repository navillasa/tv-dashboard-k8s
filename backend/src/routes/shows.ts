import express from "express";
import { getUpcomingShows } from "../services/showAggregator";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const platforms = typeof req.query.platform === "string"
      ? req.query.platform.split(",")
      : Array.isArray(req.query.platform)
        ? (req.query.platform as string[])
        : [];
    console.log("[/api/shows] Query params:", req.query, "Parsed platforms:", platforms);

    const shows = await getUpcomingShows(platforms);
    console.log("[/api/shows] Responding with shows:", shows);

    res.json(shows);
  } catch (error) {
    console.error("[/api/shows] ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
