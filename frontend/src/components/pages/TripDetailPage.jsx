import { Link } from "react-router";
import { summarizeTrip, formatMoney } from "@/utils/tripSummary";
import { formatShortDate } from "@/utils/dates";

const SECTIONS = [
  { path: "todos", icon: "📝", title: "To-do list", hint: (s) => (s.todosTotal ? `${s.openTodos} open of ${s.todosTotal}` : "Nothing added yet") },
  { path: "budget", icon: "💰", title: "Budget", hint: (s) => (s.budget ? `${s.budgetUsedPct}% used` : "Track what you spend") },
  { path: "schedule", icon: "📅", title: "Schedule", hint: (s) => (s.eventsTotal ? `${s.eventsTotal} ${s.eventsTotal === 1 ? "event" : "events"}` : "Plan your days") },
  { path: "words", icon: "📚", title: "New words", hint: () => "Phrases you've learned" },
];

function formatEventWhen(event) {
  const d = event.startDate;
  const date = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  if (event.allDay) return date;
  return `${date}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

// The trip's home screen: what matters right now first (countdown, budget,
// next event, open to-dos), then the sections of the trip.
export default function TripDetailPage({ trip, onEditTrip, onChat }) {
  const s = summarizeTrip(trip);

  return (
    <main className="page trip-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">All trips</Link> <span aria-hidden="true">/</span> <span>{trip.destination}</span>
      </nav>

      <header className="trip-page-head">
        <div>
          <h1>{trip.destination}</h1>
          <p className="trip-page-dates">
            {s.start ? `${formatShortDate(s.start)} – ${formatShortDate(s.end)}` : "No dates yet"}
            {s.length ? ` · ${s.length} days` : ""}
            {trip.travelers ? ` · ${trip.travelers}` : ""}
          </p>
        </div>
        <div className="trip-page-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onChat(trip)}>
            <span aria-hidden="true">💬</span> Ask AI
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onEditTrip(trip)}>
            <span aria-hidden="true">✏️</span> Edit trip
          </button>
        </div>
      </header>

      <section className="stat-grid" aria-label="Trip overview">
        <div className={`stat-card status-${s.status.kind}`}>
          <span className="stat-label">Countdown</span>
          <strong>{s.status.kind === "upcoming" ? s.status.days : s.status.label}</strong>
          {s.status.kind === "upcoming" && <span className="stat-sub">{s.status.days === 1 ? "day to go" : "days to go"}</span>}
        </div>

        <Link to="budget" className="stat-card">
          <span className="stat-label">Budget</span>
          {s.budget > 0 ? (
            <>
              <strong className={s.overBudget ? "over" : ""}>
                {s.overBudget ? `${formatMoney(-s.remaining)} over` : `${formatMoney(s.remaining)} left`}
              </strong>
              <div className={`meter ${s.overBudget ? "over" : ""}`} aria-hidden="true">
                <i style={{ width: `${s.budgetUsedPct}%` }} />
              </div>
              <span className="stat-sub">
                {formatMoney(s.spent)} of {formatMoney(s.budget)}
              </span>
            </>
          ) : (
            <>
              <strong>{formatMoney(s.spent)}</strong>
              <span className="stat-sub">spent · no budget set</span>
            </>
          )}
        </Link>

        <Link to="schedule" className="stat-card">
          <span className="stat-label">Next event</span>
          {s.nextEvent ? (
            <>
              <strong className="stat-text">{s.nextEvent.title}</strong>
              <span className="stat-sub">{formatEventWhen(s.nextEvent)}</span>
            </>
          ) : (
            <>
              <strong className="stat-text muted">Nothing planned</strong>
              <span className="stat-sub">Add one in the schedule</span>
            </>
          )}
        </Link>

        <Link to="todos" className="stat-card">
          <span className="stat-label">To-dos</span>
          <strong>{s.openTodos}</strong>
          <span className="stat-sub">{s.todosTotal ? `open of ${s.todosTotal}` : "nothing to do yet"}</span>
        </Link>
      </section>

      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="section-title">Plan this trip</h2>
        <div className="section-grid">
          {SECTIONS.map((sec) => (
            <Link key={sec.path} to={sec.path} className="section-card">
              <span className="section-icon" aria-hidden="true">{sec.icon}</span>
              <span>
                <strong>{sec.title}</strong>
                <span className="section-hint">{sec.hint(s)}</span>
              </span>
              <span className="section-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
