// Each trip has its own key, so calendars of different trips never mix.
// (The old app used one global key, "travel_app_events_v1", for all trips.)
function getEventsStorageKey(tripId) {
  return `travel_app_events_${tripId}`;
}

export function loadEvents(tripId) {
  try {
    const raw = localStorage.getItem(getEventsStorageKey(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load events from localStorage:", error);
    return [];
  }
}

export function saveEvents(tripId, events) {
  try {
    localStorage.setItem(getEventsStorageKey(tripId), JSON.stringify(events));
  } catch (error) {
    console.error("Failed to save events to localStorage:", error);
  }
}
