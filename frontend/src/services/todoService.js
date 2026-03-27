import { API_BASE } from "../config";


export async function fetchTodos(tripId) {
  const response = await fetch(`${API_BASE}/trips/${tripId}/todos`);

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  return response.json();
} 


export async function createTodo(tripId, text) {
  const response = await fetch(`${API_BASE}/trips/${tripId}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to add todo");
  }

  return response.json();
}

export async function updateTodo(tripId, id, completed) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/todos/${id}`,
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({completed})
    }
    )
    if(!response.ok) throw new Error('Failed to toggle todo')
    
    return response.json()
}

export async function removeTodo(tripId, id) {
const response = await fetch(`${API_BASE}/trips/${tripId}/todos/${id}`,
    {  method: 'DELETE'  } )

    if(!response.ok) throw new Error('Failed to delete todo')

}
