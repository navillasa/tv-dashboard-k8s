import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import showsRouter from "./routes/shows";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "TV Dashboard Backend is running!" });
});

app.use("/api/shows", showsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
