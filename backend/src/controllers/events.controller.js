import tripsStore from "../data/trips.store.js";
const { findTripById } = tripsStore;

// Events belong to a trip (like todos and expenses), so two trips never
// share or mix their calendars.

function isValidTimeStr(t) {
  return typeof t === "string" && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(t);
}

function getTripOr404(req, res) {
  const trip = findTripById(Number(req.params.id ?? req.params.tripId));
  if (!trip) {
    res.status(404).json({ message: "Trip not found" });
    return null;
  }
  if (!Array.isArray(trip.events)) trip.events = [];
  return trip;
}

function getEvents(req, res) {
  const trip = getTripOr404(req, res);
  if (!trip) return;
  res.json(trip.events);
}

function createEvent(req, res) {
  const trip = getTripOr404(req, res);
  if (!trip) return;

  const { title, start, end, allDay, color } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "title is required" });
  }
  if (!start || !isValidTimeStr(start)) {
    return res.status(400).json({ message: "start must be YYYY-MM-DD or YYYY-MM-DDTHH:mm" });
  }
  if (end && !isValidTimeStr(end)) {
    return res.status(400).json({ message: "end must be YYYY-MM-DD or YYYY-MM-DDTHH:mm" });
  }

  const event = {
    id: crypto.randomUUID(),
    title: title.trim(),
    start,
    end: end || undefined,
    allDay: Boolean(allDay),
    color: color || "#2563eb",
  };

  trip.events.push(event);
  return res.status(201).json(event);
}

function deleteEvent(req, res) {
  const trip = getTripOr404(req, res);
  if (!trip) return;

  const before = trip.events.length;
  trip.events = trip.events.filter((e) => e.id !== req.params.eventId);

  if (trip.events.length === before) {
    return res.status(404).json({ message: "Event not found" });
  }
  return res.sendStatus(204);
}

export default { getEvents, createEvent, deleteEvent };
