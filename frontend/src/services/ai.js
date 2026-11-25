import { API_BASE } from "../config";

function readReply(data) {
  const reply = data?.reply;

  if (typeof reply !== "string" || reply.trim() === "") {
    throw new Error("The server returned an empty or invalid reply.");
  }

  return reply;
}

// Turn a failed request into a message the user can act on.
async function requestError(response, fallback) {
  if (response.status === 429) return new Error("Too many requests. Please wait a moment and try again.");
  try {
    const data = await response.json();
    if (data?.message) return new Error(data.message);
  } catch {
    // body wasn't JSON
  }
  return new Error(fallback);
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    // fetch only throws when the server can't be reached at all
    throw new Error("Can't reach the server right now. Check your connection and try again.");
  }
}

export async function fetchTravelFact() {
  const response = await safeFetch(`${API_BASE}/ai/fact`);
  if (!response.ok) throw await requestError(response, "Couldn't load a new fact.");
  return readReply(await response.json());
}

export async function sendChatMessage({ message, mode, destination, messages }) {
  const response = await safeFetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode, destination, messages }),
  });

  if (!response.ok) throw await requestError(response, "The assistant couldn't answer. Please try again.");
  return readReply(await response.json());
}
