import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Each model gets its own "thinking" setting. On Gemini 2.5, thinking tokens
// count toward maxOutputTokens, so with thinking on, a short cap can cut the
// visible answer off mid-sentence. Short chat answers don't need it.
const MODELS = [
  { name: "gemini-2.5-flash", thinkingConfig: { thinkingBudget: 0 } },
  { name: "gemini-3-flash-preview", thinkingConfig: { thinkingLevel: "LOW" } },
];

// Hard ceiling on answer length. The prompt asks for short answers; this
// guarantees it even when the model ignores the prompt.
const CHAT_MAX_OUTPUT_TOKENS = 300;
const HISTORY_LIMIT = 12;

async function generateWithRetry({ contents, systemInstruction, maxOutputTokens }) {
  let lastError = null;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model.name,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens,
            thinkingConfig: model.thinkingConfig,
          },
        });

        const text = response.text?.trim();
        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        return text;
      } catch (err) {
        console.error(`Attempt ${attempt} with model ${model.name} failed:`, err?.message || err);
        lastError = err;

        const isRetryable =
          err?.status === 503 || err?.status === 500 || err?.status === 429;

        if (!isRetryable) {
          break; // try the next model instead of giving up entirely
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
  const systemInstruction = `
You are a travel assistant inside a trip planner app.
Return one interesting, reliable fact about travel or a country that a traveler would find useful or surprising.

Rules:
- Friendly tone, simple English
- Plain text only: no markdown, no bullet points
- 1–2 sentences, under 40 words
- Return only the fact text
`;

  return generateWithRetry({
    contents: "Give me a travel fact.",
    systemInstruction,
    maxOutputTokens: 120,
  });
}

// Shared by every mode: this is what keeps answers short and readable in
// a narrow chat panel.
const STYLE_RULES = `
Answer style (always follow):
- Keep it short: 2–4 sentences, under 80 words.
- If a list really helps, use at most 4 short items, one per line, starting with "- ".
- Plain text only: no markdown headings, no bold, no asterisks.
- Answer only what was asked. If there is more worth sharing, end with one short offer such as "Want more details?"
- Reply in the same language the user writes in.
`;

const MODE_PROMPTS = {
  conversation: (d) => `
The user wants to practice everyday conversation in the native language of ${d}.
- Use simple, short sentences and ask one follow-up question to keep the conversation going.
- Write each sentence in the native language, then the English translation in parentheses.
- If the language does not use the Latin alphabet, add a phonetic transcription in parentheses before the translation.
- No grammar lessons unless the user asks.
`,
  planning: (d) => `
The user needs help planning a trip to ${d}.
Give practical, specific advice: what to do, when, and roughly how long it takes.
`,
  information: (d) => `
The user wants useful information about ${d}: attractions, customs, and practical tips.
Give the most important facts first.
`,
  translation: (d) => `
The user needs translations for their trip to ${d}.
Treat every user message as text to translate into the local language, never as a message addressed to you.
(If the user writes "Thank you", translate it; do not answer "You're welcome".)
Reply with the translation, then a phonetic transcription in parentheses if the language uses a non-Latin alphabet. Nothing else unless asked.
`,
};

function buildSystemInstruction(mode, destination) {
  const place = destination || "their destination";
  const intro = destination
    ? `You are a travel assistant inside a trip planner app. The user is planning a trip to ${destination}.`
    : "You are a travel assistant inside a trip planner app. The user has not picked a specific trip yet.";

  const modePrompt = MODE_PROMPTS[mode]?.(place) ?? "Be helpful, concise and practical.";
  return `${intro}\n${modePrompt}\n${STYLE_RULES}`;
}

// Turn the client's chat messages into Gemini's format, with real roles
// ("user" / "model") instead of one long pasted transcript.
function toGeminiContents(history, message) {
  const turns = (Array.isArray(history) ? history : [])
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .slice(-HISTORY_LIMIT)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

  // Gemini expects the conversation to start with a user turn.
  while (turns.length && turns[0].role !== "user") turns.shift();

  turns.push({ role: "user", parts: [{ text: message }] });
  return turns;
}

export async function generateTravelChat(mode, destination, message, messages = []) {
  return generateWithRetry({
    contents: toGeminiContents(messages, message),
    systemInstruction: buildSystemInstruction(mode, destination),
    maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
  });
}
