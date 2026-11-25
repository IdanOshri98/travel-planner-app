import { useState, useEffect } from "react";
import { fetchTravelFact } from "@/services/ai";
import { facts } from "../../store/facts";


function DailyFact() {
  const [factData, setFactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
        loadFact();
    }, []);

    async function loadFact({ forceServer = false } = {}) {
        try {
            setLoading(true);
            setError(null);

            if (!forceServer && Math.random() < 0.9) {
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            setFactData(randomFact);
            } else {
            setFactData(await fetchTravelFact());
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            setFactData(facts[Math.floor(Math.random() * facts.length)]);
        } finally {
            setLoading(false);
        }
        }

    if (loading) return <p>Loading fact...</p>;

    return (
        <div className="fact-card">
            <h3>Did you know?</h3>

            <p>
                {factData}
            </p>

            {error && <p role="alert">{error}</p>}

            <button onClick={() => loadFact({ forceServer: true })}>New Fact</button>
        </div>
    );
}

export default DailyFact;