import express from "express";
import { getUpcomingShows } from "../services/showAggregator";

const router = express.Router();

// GET /api/shows/upcoming?platform=netflix,disney
router.get("/upcoming", async (req, res) => {
  const platforms = (req.query.platform as string)?.split(",") || [];
  try {
    const shows = await getUpcomingShows(platforms);
    res.json(shows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch shows", details: (e as Error).message });
  }
});

export default router;
