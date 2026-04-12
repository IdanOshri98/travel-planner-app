import express from "express";
import { handleChat, getRandomFact } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/fact", getRandomFact);
router.post("/chat", handleChat);

export default router;