import express from "express";
import cors from "cors";
import chessRouter from "../backend/routes/chessRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Handle both /api/chess and /chess (in case of different rewrite behaviors)
app.use("/api/chess", chessRouter);
app.use("/chess", chessRouter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
