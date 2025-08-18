import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import showsRouter from "./routes/shows";
import { register } from "./metrics";
import { metricsMiddleware } from "./middleware/metrics";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
  res.json({ message: "TV Dashboard Backend is running!" });
});

// Health check endpoint for Kubernetes probes
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint for Prometheus
app.get("/metrics", async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

app.use("/api/shows", showsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
