// Trip dates are stored as "DD/MM/YYYY" (older data may be "YYYY-MM-DD").
// These helpers convert them once, so components can work with real Dates.

export function parseTripDate(value) {
  if (!value || typeof value !== "string") return null;

  let y, m, d;
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dmy) [, d, m, y] = dmy;
  else if (iso) [, y, m, d] = iso;
  else return null;

  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

// "YYYY-MM-DD" in local time (what <input type="date"> and FullCalendar use).
export function toISODate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "YYYY-MM-DD" -> "DD/MM/YYYY", the format trips are stored in.
export function isoToTripDate(iso) {
  const date = parseTripDate(iso);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Whole days from today until `date` (negative if it's in the past).
export function daysUntil(date, today = new Date()) {
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(today)) / DAY_MS);
}

// Inclusive trip length: 1–3 March is 3 days.
export function tripLength(start, end) {
  if (!start || !end) return null;
  return Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS) + 1;
}

export function formatShortDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Where the trip is relative to today, for cards and the trip dashboard.
export function tripStatus(trip, today = new Date()) {
  const start = parseTripDate(trip?.startDate);
  const end = parseTripDate(trip?.endDate);
  if (!start) return { kind: "undated", label: "No dates yet" };

  const toStart = daysUntil(start, today);
  const toEnd = end ? daysUntil(end, today) : toStart;

  if (toStart > 1) return { kind: "upcoming", label: `In ${toStart} days`, days: toStart };
  if (toStart === 1) return { kind: "upcoming", label: "Tomorrow", days: 1 };
  if (toEnd >= 0) return { kind: "now", label: "Happening now" };
  return { kind: "past", label: "Past trip" };
}
