export function getWordsStorageKey(tripId) {
  return `travel_app_words_${tripId}`;
}

export function loadWords(tripId) {
  try {
    const raw = localStorage.getItem(getWordsStorageKey(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load words from localStorage:", error);
    return [];
  }
}

export function saveWords(tripId, words) {
  try {
    localStorage.setItem(getWordsStorageKey(tripId), JSON.stringify(words));
  } catch (error) {
    console.error("Failed to save words to localStorage:", error);
  }
}