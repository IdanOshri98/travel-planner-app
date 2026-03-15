const TRIPS_STORAGE_KEY = "travel_app_trips_v1";

export function loadTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load trips from localStorage:", error);
    return [];
  }
}

export function saveTrips(trips) {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error("Failed to save trips to localStorage:", error);
  }
}