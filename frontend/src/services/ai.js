import { API_BASE } from "../config";

function readReply(data) {
  const reply = data?.reply;

  if (typeof reply !== "string" || reply.trim() === "") {
    throw new Error("The server returned an empty or invalid reply.");
  }

  return reply;
}

export async function fetchTravelFact() {
  const response = await fetch(`${API_BASE}/ai/fact`);

  if (!response.ok) {
    throw new Error("Failed to fetch fact");
  }

  const data = await response.json();
  return readReply(data);
}

export async function sendChatMessage({message, mode, destination, messages}) {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, mode, destination, messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  const data = await response.json();
  return readReply(data);
  
}