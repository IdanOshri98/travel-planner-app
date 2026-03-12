let events = [
  {
    id: "1",
    title: "Flight ✈️",
    start: "2026-03-01T10:00",
    end: "2026-03-01T12:00",
    allDay: false,
    color: "#2563eb",
  },
];

export function getAllEvents() {
  return events;
}

export function addEvent(event) {
  events.push(event);
  return event;
}

export function deleteEventById(id) {
  const before = events.length;
  events = events.filter((e) => e.id !== id);
  return events.length !== before; // true אם נמחק משהו
}