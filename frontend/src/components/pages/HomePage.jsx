import DailyFact from "@/components/layout/DailyFact";
import TripCard from "@/components/trips/TripCard";
import { parseTripDate, tripStatus } from "@/utils/dates";

// Upcoming and current trips first (soonest first), past trips at the end.
function sortTrips(trips) {
  const rank = { now: 0, upcoming: 1, undated: 2, past: 3 };
  return [...trips].sort((a, b) => {
    const ra = rank[tripStatus(a).kind];
    const rb = rank[tripStatus(b).kind];
    if (ra !== rb) return ra - rb;
    const da = parseTripDate(a.startDate)?.getTime() ?? 0;
    const db = parseTripDate(b.startDate)?.getTime() ?? 0;
    return ra === 3 ? db - da : da - db;
  });
}

function HomePage({ trips, status, onAddTrip, onEditTrip, onDeleteTrip, onChat }) {
  return (
    <main className="page home-page">
      <section className="home-hero">
        <h1>Plan your next adventure</h1>
        <p>Trips, budget, schedule and an AI travel assistant, in one place.</p>
      </section>

      <DailyFact />

      <section className="home-trips" aria-labelledby="trips-heading">
        <div className="section-head">
          <h2 id="trips-heading">Your trips</h2>
          {trips.length > 0 && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onAddTrip}>
              + New trip
            </button>
          )}
        </div>

        {status === "loading" && (
          <div className="trip-grid" aria-busy="true" aria-label="Loading trips">
            <div className="trip-card skeleton" />
            <div className="trip-card skeleton" />
          </div>
        )}

        {status === "error" && (
          <div className="state-box error" role="alert">
            <p>We couldn't load your trips. Check your connection and refresh the page.</p>
          </div>
        )}

        {status === "ready" && trips.length === 0 && (
          <div className="state-box empty">
            <div className="state-icon" aria-hidden="true">🧳</div>
            <h3>No trips yet</h3>
            <p>Create your first trip to start tracking your budget, schedule and to-dos.</p>
            <button type="button" className="btn btn-primary" onClick={onAddTrip}>
              Create your first trip
            </button>
          </div>
        )}

        {status === "ready" && trips.length > 0 && (
          <div className="trip-grid">
            {sortTrips(trips).map((trip) => (
              <TripCard key={trip.id} trip={trip} onEdit={onEditTrip} onDelete={onDeleteTrip} onChat={onChat} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;
