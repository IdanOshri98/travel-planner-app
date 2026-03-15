function getEventsStorageKey() {
  return "travel_app_events_v1";
}

export function loadEvents() {
  try {
    const raw = localStorage.getItem(getEventsStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load events from localStorage:", error);
    return [];
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(getEventsStorageKey(), JSON.stringify(events));
  } catch (error) {
    console.error("Failed to save events to localStorage:", error);
  }
}