import { useEffect, useMemo, useState } from "react";
import { DATA_MODE } from "../../config";
import { loadWords, saveWords } from "../../utils/wordsStorage";
import useWordsStore from "../../store/useWordsStore";
import { fetchWords, createWord, updateWordRating, removeWord } from "../../services/wordService";


export default function NewWordsPage({ trip, onBack }) {

  const initialLanguage = trip?.destination || "unknown";
  const [languageInput, setLanguageInput] = useState(initialLanguage);
  const language = normalizeLanguage(languageInput.trim() || initialLanguage);
  const words = useWordsStore((state) => state.wordsByLanguage[language] || []);

  const setWords = useWordsStore((state) => state.setWords);
  const addWordToStore = useWordsStore((state) => state.addWordToStore);
  const updateWordInStore = useWordsStore((state) => state.updateWordInStore);
  const deleteWordFromStore = useWordsStore((state) => state.deleteWordFromStore);

  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [openWordId, setOpenWordId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!trip?.id) return;

    // If we're in demo mode, load words from localStorage instead of API
    if(DATA_MODE === "demo") {
      const storeWords = loadWords(normalizeLanguage(language));
      setWords(language, storeWords);
      return;
    }

    fetchWords(trip.id)
      .then((data) => setWords(language, data))
      .catch((err) => console.error("Error fetching words:", err));
  }, [trip?.id, setWords, language]);

  const handleAddNewWord = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const newWord = {
      word: formData.get("word"),
      translation: formData.get("translation"),
    };

    // In demo mode, we save the new word to localStorage instead of sending it to the API
    if(DATA_MODE === "demo") {
      const wordWithId = { ...newWord, id: Date.now() };
      addWordToStore(language, wordWithId);
      setShowAddWordForm(false);
      saveWords(normalizeLanguage(language), useWordsStore.getState().wordsByLanguage[language]);
      e.target.reset();
      return;
    }


    try {

      const savedWord = await createWord(trip.id, newWord.word, newWord.translation);
      addWordToStore(language, savedWord);
      setShowAddWordForm(false);
      e.target.reset();
    } catch (err) {
      console.error("Error adding word:", err);
    }
  };


  const handleUpdateWordRating  = async (id, newRating) => {

    // In demo mode, we update the word rating in localStorage instead of sending it to the API
    if (DATA_MODE === "demo") {
      updateWordInStore(language, id, newRating);
      const updatedWords = useWordsStore.getState().wordsByLanguage[language];
      saveWords(normalizeLanguage(language), updatedWords);
      return;
    }


  const wordToUpdate = words.find(word => word.id === id);
  if (!wordToUpdate) return;

    try{ 
      await updateWordRating(trip.id, id, newRating);
      updateWordInStore(language, id, newRating);

    }catch (error) {
      console.error('Error toggling word:', error)
    }

}

  const deleteWord = async (id) => {

    // In demo mode, we delete the word from localStorage instead of sending a delete request to the API
    if (DATA_MODE === "demo") {
      deleteWordFromStore(language, id);
      if (openWordId === id) setOpenWordId(null);
      const updatedWords = useWordsStore.getState().wordsByLanguage[language] || [];
      saveWords(normalizeLanguage(language), updatedWords);
      return;
    }

    try {
      await removeWord(trip.id, id);
      deleteWordFromStore(language, id);

      if (openWordId === id) setOpenWordId(null);
    } catch (err) {
      console.error("Error deleting word:", err);
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = words.filter((w) => {
      if (!q) return true;
      return (
        (w.word || "").toLowerCase().includes(q) ||
        (w.translation || "").toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => (a.rating ?? 1) - (b.rating ?? 1));
    return filtered;
  }, [words, query]);

  return (
  <div className="new-words-page">
    <div className="page-shell">
      <div className="nw-header">
        <h1>New Words for {trip?.destination}</h1>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="nw-subheader">
        <input
          className="search"
          placeholder="Search word / translation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className="add-word-btn"
          onClick={() => setShowAddWordForm(true)}
        >
          + Add Word
        </button>

        <input
          className="destination-language"
          name = "language"
          type="text"
          placeholder="Destination Language"
          value={languageInput}
          onChange={(e) => setLanguageInput(e.target.value)}
        />

      </div>

      {showAddWordForm && (
        <div className="add-word-form">
          <h2>✨ Add New Word</h2>
          <form onSubmit={handleAddNewWord}>
            <input
              name="word"
              type="text"
              placeholder="Word (e.g. museo)"
              required
            />
            <input
              name="translation"
              type="text"
              placeholder="Translation (e.g. מוזיאון)"
              required
            />

            <div className="form-buttons">
              <button
                type="button"
                onClick={() => setShowAddWordForm(false)}
              >
                Cancel
              </button>
              <button type="submit">Add Word</button>
            </div>
          </form>
        </div>
      )}

      <div className="nw-list">
        {filteredAndSorted.length === 0 ? (
          <p className="empty-state">No words yet.</p>
        ) : (
          filteredAndSorted.map((w) => (
            <WordRow
              key={w.id}
              item={w}
              isOpen={openWordId === w.id}
              onToggleOpen={() =>
                setOpenWordId((cur) => (cur === w.id ? null : w.id))
              }
              onDelete={() => deleteWord(w.id)}
              onRatingChange={handleUpdateWordRating}
            />
          ))
        )}
      </div>
    </div>
  </div>
);
}

function normalizeLanguage(language) {
  return language.trim().toLowerCase();
}

function WordRow({ item, isOpen, onRatingChange, onToggleOpen, onDelete }) {
  return (
    <div className="word-card" data-rating={item.rating}>
      <div className="word-main">
        <button
          type="button"
          className="word-btn"
          onClick={onToggleOpen}
          title="Click to show translation"
        >
          <div className="word-title">
            <span className="word-text">{item.word}</span>
          </div>

          <div className={`translation ${isOpen ? "open" : ""}`}>
            {isOpen ? item.translation : "tap to see translation"}
          </div>
        </button>

        <div className="word-actions">
          <label>Rate your knowledge (1 = don’t know, 5 = know well)</label>
          <div className="btn-row">
            <select 
                name="rate" 
                defaultValue={item.rating ?? 1}
                onChange={(e) => onRatingChange(item.id, Number(e.target.value))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            <button type="button" className="btn danger" onClick={onDelete}>
              delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}