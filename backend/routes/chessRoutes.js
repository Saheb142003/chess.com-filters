import express from "express";
import { fetchGamesByCountry } from "../services/chessServices.js";

const router = express.Router();

router.get("/:username", async (req, res) => {
  try {
    const data = await fetchGamesByCountry(req.params.username);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
