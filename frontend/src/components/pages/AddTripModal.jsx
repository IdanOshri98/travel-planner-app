import { useEffect, useState } from "react";
import { parseTripDate, toISODate, isoToTripDate } from "@/utils/dates";

const TRAVELER_OPTIONS = ["1 Person", "2 People", "3 People", "4+ People"];

// Add / edit trip form. Uses native date pickers; trips are still saved in
// the existing DD/MM/YYYY format, so older data keeps working.
function AddTripModal({ isOpen, editingTrip, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      destination: editingTrip?.destination ?? "",
      startDate: toISODate(parseTripDate(editingTrip?.startDate)),
      endDate: toISODate(parseTripDate(editingTrip?.endDate)),
      budget: editingTrip?.budget ? String(editingTrip.budget) : "",
      travelers: TRAVELER_OPTIONS.includes(editingTrip?.travelers) ? editingTrip.travelers : "1 Person",
    });
    setError("");
    setSaving(false);
  }, [isOpen, editingTrip]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !form) return null;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination.trim()) return setError("Please enter a destination.");
    if (form.endDate < form.startDate) return setError("The end date can't be before the start date.");

    setSaving(true);
    const ok = await onSave({
      destination: form.destination.trim(),
      startDate: isoToTripDate(form.startDate),
      endDate: isoToTripDate(form.endDate),
      budget: Number(form.budget) || 0,
      travelers: form.travelers,
    });
    setSaving(false);
    if (!ok) setError("Couldn't save the trip. Please try again.");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="trip-form-title">{editingTrip ? "Edit trip" : "New trip"}</h2>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Destination</span>
            <input
              name="destination"
              type="text"
              placeholder="e.g. Rome"
              value={form.destination}
              onChange={set("destination")}
              required
              autoFocus
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Start date</span>
              <input name="startDate" type="date" value={form.startDate} onChange={set("startDate")} required />
            </label>
            <label className="field">
              <span>End date</span>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={set("endDate")}
                required
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Budget ($)</span>
              <input
                name="budget"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Optional"
                value={form.budget}
                onChange={set("budget")}
              />
            </label>
            <label className="field">
              <span>Travelers</span>
              <select name="travelers" value={form.travelers} onChange={set("travelers")}>
                {TRAVELER_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="modal-buttons">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingTrip ? "Save changes" : "Create trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTripModal;
