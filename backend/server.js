import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chessRouter from "./routes/chessRoutes.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/chess", chessRouter);

app.listen(PORT, () => {
  console.log("Server running on port", { PORT });
});
