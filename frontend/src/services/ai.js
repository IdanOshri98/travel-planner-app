import { API_BASE } from "../config";

export async function fetchTravelFact() {
  const response = await fetch(`${API_BASE}/ai/fact`);

  if (!response.ok) {
    throw new Error("Failed to fetch fact");
  }

  const data = await response.json();
  return data.reply;}

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
  return data.reply;
  
}