import { getAllEvents, addEvent, deleteEventById } from "../data/events.store.js";

function isValidTimeStr(t) {
  return typeof t === "string" && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(t);
}

export function getEvents(req, res) {
  res.json(getAllEvents());
}

export function createEvent(req, res) {
  const { title, start, end, allDay, color } = req.body ?? {};

  // ולידציה מינימלית
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
    id: Date.now().toString(),
    title: title.trim(),
    start,
    end: end || undefined,
    allDay: Boolean(allDay),
    color: color || "#2563eb",
  };

  addEvent(event);
  return res.status(201).json(event);
}

export function deleteEvent(req, res) {
  const { id } = req.params;
  const removed = deleteEventById(id);

  if (!removed) {
    return res.status(404).json({ message: "Event not found" });
  }
  return res.sendStatus(204);
}