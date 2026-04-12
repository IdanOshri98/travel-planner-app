import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(prompt) {
  const modelsToTry = ["gemini-2.5-flash", "gemini-3-flash-preview"];
  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const text = response.text?.trim();
        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        return text;
      } catch (err) {
        console.error(`Attempt ${attempt} with model ${model} failed:`, err);
        lastError = err;

        const isRetryable =
          err?.status === 503 || err?.status === 500 || err?.status === 429;

        if (!isRetryable) {
          throw err;
        }

        if (attempt < 3) {
          await sleep(1000 * 2 ** (attempt - 1));
        }
      }
    }
  }

  throw lastError;
}

export async function generateRandomTravelFact() {
  const prompt = `
You are a travel assistant inside a trip planner app.

Generate one interesting, reliable fact about travel or a country.

Rules:
- Friendly tone
- Simple English
- No markdown
- No bullet points
- Return only the fact text
- At least 2 sentences long
- Make sure it's something that a traveler would find useful or surprising.
`;

  return generateWithRetry(prompt);
}

export async function generateTravelChat(mode, destination, message, messages = []) {
  let systemPrompt = `You are a travel assistant inside a trip planner app. The user is planning a trip to ${destination}.`;

  switch (mode) {
    case "conversation":
      systemPrompt += `
The user wants to practice conversation skills in the native language of ${destination}.
Use simple and short sentences, and ask follow-up questions to keep the conversation going.

Rules:
- Friendly tone
- Use the native language and after each sentence provide a simple English translation in parentheses.
- If the native language does not use the Latin alphabet, provide phonetic transcription in parentheses and then English translation in parentheses.
- Avoid complex grammar and vocabulary.
- Do not provide grammar lessons unless the user asks for clarification.
`;
      break;

    case "planning":
      systemPrompt += `
The user needs help planning a trip to ${destination}.
Give practical, concise, useful travel advice tailored to the destination.
`;
      break;

    case "information":
      systemPrompt += `
The user wants useful information about ${destination}.
Focus on attractions, customs, and practical travel tips.
`;
      break;

    case "translation":
      systemPrompt += `
The user needs translation help related to their trip.
Provide accurate translations in the local language of ${destination}.
If the user asks for Hebrew, also provide phonetic transcription and English translation.
`;
      break;

    default:
      systemPrompt += `
Be helpful, concise, and practical.
`;
  }

  const historyText = messages
    .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n");

  const fullPrompt = `
${systemPrompt}

Conversation so far:
${historyText}

User message:
${message}

Respond as the assistant only.
`;

  return generateWithRetry(fullPrompt);
}