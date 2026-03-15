function getTodosStorageKey(tripId) {
  return `travel_app_todos_${tripId}`;
}

export function loadTodos(tripId) {
  try {
    const raw = localStorage.getItem(getTodosStorageKey(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load todos from localStorage:", error);
    return [];
  }
}

export function saveTodos(tripId, todos) {
  try {
    localStorage.setItem(getTodosStorageKey(tripId), JSON.stringify(todos));
  } catch (error) {
    console.error("Failed to save todos to localStorage:", error);
  }
}