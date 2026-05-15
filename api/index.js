import express from "express";
import cors from "cors";
import chessRouter from "../backend/routes/chessRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Match the expected relative path
app.use("/api/chess", chessRouter);

export default app;
