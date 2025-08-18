import express from "express";
import { getUpcomingShows } from "../services/showAggregator";
import { tvShowsRequested } from "../metrics";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const platforms = typeof req.query.platform === "string"
      ? req.query.platform.split(",")
      : Array.isArray(req.query.platform)
        ? (req.query.platform as string[])
        : [];
    const shows = await getUpcomingShows(platforms);

    // Record metrics for business intelligence
    if (platforms.length > 0) {
      platforms.forEach(platform => {
        tvShowsRequested.labels(platform).inc();
      });
    } else {
      tvShowsRequested.labels('all').inc();
    }

    res.json(shows);
  } catch (error) {
    console.error("[/api/shows] ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
