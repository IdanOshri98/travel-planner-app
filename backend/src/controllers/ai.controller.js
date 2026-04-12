import { generateRandomTravelFact, generateTravelChat } from "../services/gemini.service.js";

export async function getRandomFact(req, res, next) {
  try {
    const result = await generateRandomTravelFact();
    res.json({fact: result});
  } catch (error) {
    next(error);
  }
}

export async function handleChat(req, res, next) {
  try {
    const { message, mode, destination, messages } = req.body;

    const response = await generateTravelChat(mode, destination, message, messages);

    // Here you would integrate with your AI service (e.g., OpenAI, Gemini) to get a response based on the message, mode, and destination.
    // For demonstration, we'll return a simple echo response.
    res.json({ response });
  } catch (error) {
    next(error);
  }
}