import { API_BASE } from "../config";


export async function fetchWords(tripId) {
  const response = await fetch(`${API_BASE}/trips/${tripId}/words`);

  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }

  return response.json();
} 


export async function createWord(tripId, word, translation) {
  const response = await fetch(`${API_BASE}/trips/${tripId}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, translation }),
  });

  if (!response.ok) {
    throw new Error("Failed to add word");
  }

  return response.json();
}

export async function updateWordRating(tripId, id, rating) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/words/${id}`,
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({rating})
    }
    )
    if(!response.ok) throw new Error('Failed to edit word')
    
    return response.json()
}

export async function removeWord(tripId, id) {
const response = await fetch(`${API_BASE}/trips/${tripId}/words/${id}`,
    {  method: 'DELETE'  } )

    if(!response.ok) throw new Error('Failed to delete word')

}
