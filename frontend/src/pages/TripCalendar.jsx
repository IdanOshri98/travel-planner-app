import { useMemo, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import { API_BASE, DATA_MODE } from "../config";
import { loadEvents, saveEvents } from "../utils/eventsStorage";


const COLOR_OPTIONS = [
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#dc2626" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Gray", value: "#6b7280" },
];

function toFullCalendarEvent(e) {
  return {
    ...e,
    backgroundColor: e.color,
    borderColor: e.color,
    textColor: "#ffffff",
  };
}

export default function TripCalendar({ onBack }) {

  const [events, setEvents] = useState([]);

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({
    dateStr: "",          // YYYY-MM-DD (from dateClick)
    title: "",
    allDay: true,
    startTime: "10:00",        // HH:mm
    endTime: "11:00",
    color: COLOR_OPTIONS[0].value,
  });


  useEffect(()=>{
    async function fetchEvents() {

      if (DATA_MODE === "demo") {
        const storedEvents = loadEvents();
        setEvents(storedEvents.map(toFullCalendarEvent));
        return;
    }

      try{
        const res = await fetch(`${API_BASE}/events`);
        if(!res.ok){
          console.error("GET /events failed:", res.status);
          return;
        }
        const data = await res.json();
        setEvents(data.map(toFullCalendarEvent));
      }catch(err){
        console.error("Failed to load events:", err);
      }
    }
    fetchEvents();
  },[]);



  const canSave = useMemo(() => {
    if (!draft.title.trim()) return false;
    if (!draft.dateStr) return false;
    if (!draft.allDay && (!/^\d{2}:\d{2}$/.test(draft.startTime) || !/^\d{2}:\d{2}$/.test(draft.endTime))) return false;
    if (!draft.allDay && draft.endTime <= draft.startTime) return false;
    return true;
  }, [draft]);

  function openModalForDate(dateStr) {
    setDraft({
      dateStr,
      title: "",
      allDay: true,
      startTime: "10:00",
      endTime: "11:00",
      color: COLOR_OPTIONS[0].value,
    });
    setIsOpen(true);
  }

  async function saveEvent() {
    if (!canSave) return;

    const createdEvent={
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      start: draft.allDay ? draft.dateStr : `${draft.dateStr}T${draft.startTime}`,
      end: draft.allDay ? undefined : `${draft.dateStr}T${draft.endTime}`,
      allDay: draft.allDay,
      color: draft.color,
    }

    if (DATA_MODE === "demo") {
      const updatedEvents = [...events, toFullCalendarEvent(createdEvent)];
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      setIsOpen(false);
      return;
    }

    try{
      const res= await fetch(`${API_BASE}/events`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(createdEvent),
      });

      if(!res.ok){
        const text = await res.text().catch(() => "");
        console.error("POST /events failed:", res.status, text);
        alert("Failed to save event (check backend logs)");
        return;
      }

      const saved = await res.json();
      setEvents((prev) => [...prev, toFullCalendarEvent(saved)]);
      setIsOpen(false);
    }catch(err){
        console.error("Failed to save event: ", err);
        alert("Failed to save event (network error).")
    }
  }

  async function deleteEventById(id){

    if (DATA_MODE === "demo") {
      const updatedEvents = events.filter((e) => e.id !== id);
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      return true;
    }

    try{
      const res= await fetch(`${API_BASE}/events/${id}`,{ method: "DELETE" });

      if(!res.ok){
        const text = await res.text().catch(() => "");
        console.error("DELETE /events failed:", res.status, text);
        return false;
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch(err){
        console.error("Failed to delete event:", err);
        alert("Failed to delete event (network error).");
        return false;
    }
  }

  return (
    <div className="trip-calendar-wrap">
      <div className="trip-calendar-card">
        <div className="trip-calendar-header">
          <div>
            <p className="trip-calendar-title">Trip Schedule</p>
            <p className="trip-calendar-subtitle">Click a day to add an event</p>
          </div>

          {onBack && (
            <button className="trip-calendar-btn" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>

        <div className="trip-calendar-body">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
            themeSystem="bootstrap5"
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            nowIndicator={true}
            events={events}
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            dateClick={(info) => openModalForDate(info.dateStr)}
            eventClick={async (clickInfo) => {
              const ok = confirm(`Delete "${clickInfo.event.title}"?`);
              if (!ok) return;
                await deleteEventById(clickInfo.event.id);
            }}
          />
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="tc-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="tc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tc-modal-header">
              <div className="tc-modal-title">Add event</div>
              <button className="tc-x" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="tc-modal-body">
              <div className="tc-row">
                <div className="tc-field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={draft.dateStr}
                    onChange={(e) => setDraft((d) => ({ ...d, dateStr: e.target.value }))}
                  />
                </div>

                <div className="tc-field">
                  <span>Color</span>
                  <select
                    value={draft.color}
                    onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <div className="tc-color-preview" style={{ background: draft.color }} />
                </div>
              </div>

              <label className="tc-field">
                <span>Title</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Museum tickets 🎟️"
                />
              </label>

              <label className="tc-check">
                <input
                  type="checkbox"
                  checked={draft.allDay}
                  onChange={(e) => setDraft((d) => ({ ...d, allDay: e.target.checked }))}
                />
                <span>All day</span>
              </label>

              {!draft.allDay && (
                <>
                <label className="tc-field">
                  <span>start hour</span>
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                  />
                </label>

                <label className="tc-field">
                  <span>end hour</span>
                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
                  />
                </label>
                </>
              )}
            </div>

            <div className="tc-modal-footer">
              <button className="tc-btn ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button className="tc-btn" onClick={saveEvent} disabled={!canSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}