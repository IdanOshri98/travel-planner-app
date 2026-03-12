import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/trips";

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

export default function NewWordsPage({ trip, onBack }) {
  const [words, setWords] = useState([]);
  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [openWordId, setOpenWordId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!trip?.id) return;

    fetch(`${API_BASE}/${trip.id}/words`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch words");
        return res.json();
      })
      .then((data) => setWords(data))
      .catch((err) => console.error("Error fetching words:", err));
  }, [trip?.id]);

  const handleAddNewWord = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const newWord = {
      word: formData.get("word"),
      translation: formData.get("translation"),
    };

    try {
      const response = await fetch(`${API_BASE}/${trip.id}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWord),
      });

      if (!response.ok) throw new Error("Failed to add word");

      const savedWord = await response.json();
      setWords((prev) => [...prev, savedWord]);
      setShowAddWordForm(false);
      e.target.reset();
    } catch (err) {
      console.error("Error adding word:", err);
    }
  };


  const updateWordRating  = async (id, newRating) => {
  const wordToUpdate = words.find(word => word.id === id)
    if (!wordToUpdate) return

    try{ 
      const response = await fetch(`${API_BASE}/${trip.id}/words/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({rating: newRating})
        }
      )
      if(!response.ok) throw new Error('Failed to toggle word')

      const updatedWord = await response.json()

      setWords(prev => 
                  prev.map(word => word.id === id ? updatedWord : word  ))

    }catch (error) {
      console.error('Error toggling word:', error)
    }

}

  const deleteWord = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${trip.id}/words/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete word");

      setWords((prev) => prev.filter((w) => w.id !== id));
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
              onRatingChange={updateWordRating}
            />
          ))
        )}
      </div>
    </div>
  </div>
);
}