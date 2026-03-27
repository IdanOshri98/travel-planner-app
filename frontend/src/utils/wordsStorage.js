export function getWordsStorageKey(language) {
  return `travel_app_words_${language}`;
}

export function loadWords(language) {
  try {
    const raw = localStorage.getItem(getWordsStorageKey(language));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load words from localStorage:", error);
    return [];
  }
}

export function saveWords(language, words) {
  try {
    localStorage.setItem(getWordsStorageKey(language), JSON.stringify(words));
  } catch (error) {
    console.error("Failed to save words to localStorage:", error);
  }
}