import { generateRandomTravelFact, generateTravelChat } from "../services/gemini.service.js";

const VALID_MODES = new Set(["conversation", "planning", "information", "translation"]);

export async function getRandomFact(req, res, next) {
  try {
    const result = await generateRandomTravelFact();
    res.json({ reply: result });
  } catch (error) {
    next(error);
  }
}

export async function handleChat(req, res, next) {
  try {
    const { message, mode, destination, messages } = req.body ?? {};

    // Validate before spending an API call on a bad request.
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }
    if (message.length > 1000) {
      return res.status(400).json({ message: "message is too long (max 1000 characters)" });
    }
    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({ message: `mode must be one of: ${[...VALID_MODES].join(", ")}` });
    }

    const reply = await generateTravelChat(
      mode,
      typeof destination === "string" ? destination.trim() : "",
      message.trim(),
      Array.isArray(messages) ? messages : []
    );

    res.json({ reply });
  } catch (error) {
    next(error);
  }
}
