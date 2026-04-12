import { useState, useEffect } from "react";
import { fetchTravelFact } from "@/services/ai";


function DailyFact() {
  const [factData, setFactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facts, setFacts] = useState(["Traveling improves your creativity and reduces stress"]);


  useEffect(() => {
        loadFact();
    }, []);

    async function loadFact() {
        try {
            setLoading(true);

            if( Math.random() < 0.9 ) {
                const randomFact = facts[Math.floor(Math.random() * facts.length)];
                setFactData(randomFact);
            }else{
                const data = await fetchTravelFact();
                const newFact = data.fact;
                setFacts(prev => [newFact, ...prev]);
                setFactData(newFact);
            }
           
        } catch (err) {
            console.error(err);
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

            <button onClick={loadFact}>New Fact</button>
        </div>
    );
}

export default DailyFact;