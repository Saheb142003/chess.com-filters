import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chessRouter from "./routes/chessRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow Netlify to talk to Render
app.use(cors({
  origin: "*", // In production, you can replace this with your netlify URL
  methods: ["GET", "POST"]
}));

app.use(express.json());

app.use("/api/chess", chessRouter);

// Health check for Render's zero-downtime deploys
app.get("/", (req, res) => {
  res.send("Chess Analysis Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
