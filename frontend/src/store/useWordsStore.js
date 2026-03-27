import { create } from "zustand";

const useWordsStore = create((set) => ({
  wordsByLanguage: {},

  setWords: (language, words) => set((state) => ({
    wordsByLanguage: {
      ...state.wordsByLanguage,
      [language]: words
    }
  })),

  addWordToStore: (language, word) =>
    set((state) => ({
      wordsByLanguage: {
        ...state.wordsByLanguage,
        [language]: [...state.wordsByLanguage[language], word]
      }
    })),

  updateWordInStore: (language, id, newRating) =>
  set((state) => ({
    wordsByLanguage: {
      ...state.wordsByLanguage,
      [language]: state.wordsByLanguage[language].map(word => 
                        word.id === id ? { ...word, rating: newRating } : word),
    },
  })),

  deleteWordFromStore: (language, id) =>
    set((state) => ({
      wordsByLanguage: {
        ...state.wordsByLanguage,
        [language]: state.wordsByLanguage[language].filter((word) => word.id !== id)
      }
    })),
}));

export default useWordsStore;