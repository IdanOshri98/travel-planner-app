import { useState } from "react";
import { fetchTravelFact } from "@/services/ai";
import { facts } from "../../store/facts";

const randomLocalFact = () => facts[Math.floor(Math.random() * facts.length)];

function DailyFact() {
  // The first fact comes from the local list, so the card shows instantly.
  const [fact, setFact] = useState(randomLocalFact);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function loadNewFact() {
    setLoading(true);
    setNote("");
    try {
      setFact(await fetchTravelFact());
    } catch (err) {
      console.error(err);
      // Fall back to a local fact, and say so quietly instead of showing an error.
      setFact(randomLocalFact());
      setNote("Showing a saved fact. The AI fact service isn't available right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fact-card" aria-labelledby="fact-heading" aria-busy={loading}>
      <div className="fact-text">
        <h2 id="fact-heading">Did you know?</h2>
        <p>{fact}</p>
        {note && <p className="fact-note">{note}</p>}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={loadNewFact} disabled={loading}>
        {loading ? "Loading…" : "New fact"}
      </button>
    </section>
  );
}

export default DailyFact;
