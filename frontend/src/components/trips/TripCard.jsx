import { Link } from "react-router";
import { summarizeTrip, formatMoney } from "@/utils/tripSummary";
import { formatShortDate } from "@/utils/dates";

// One trip on the home page. The whole card is a link to the trip; the
// action buttons sit outside the link so they're separate, labelled targets.
export default function TripCard({ trip, onEdit, onDelete, onChat }) {
  const s = summarizeTrip(trip);

  return (
    <article className="trip-card">
      <Link to={`/trips/${trip.id}`} className="trip-card-link">
        <div className="trip-card-top">
          <h3>{trip.destination}</h3>
          <span className={`status-pill ${s.status.kind}`}>{s.status.label}</span>
        </div>

        <p className="trip-card-dates">
          {s.start ? `${formatShortDate(s.start)} – ${formatShortDate(s.end)}` : "Add dates to plan your days"}
          {s.length ? ` · ${s.length} days` : ""}
        </p>

        {s.budget > 0 ? (
          <div className="budget-meter">
            <div className="budget-meter-label">
              <span>{formatMoney(s.spent)} spent</span>
              <span className={s.overBudget ? "over" : ""}>
                {s.overBudget ? `${formatMoney(-s.remaining)} over` : `${formatMoney(s.remaining)} left`}
              </span>
            </div>
            <div
              className={`meter ${s.overBudget ? "over" : ""}`}
              role="progressbar"
              aria-label="Budget used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={s.budgetUsedPct}
            >
              <i style={{ width: `${s.budgetUsedPct}%` }} />
            </div>
          </div>
        ) : (
          <p className="trip-card-muted">No budget set</p>
        )}
      </Link>

      <div className="trip-card-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChat(trip)}>
          <span aria-hidden="true">💬</span> Ask AI
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(trip)}>
          <span aria-hidden="true">✏️</span> Edit
        </button>
        <button type="button" className="btn btn-ghost btn-ghost-danger btn-sm" onClick={() => onDelete(trip)}>
          <span aria-hidden="true">🗑️</span> Delete
        </button>
      </div>
    </article>
  );
}
