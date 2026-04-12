export default function TripFormModal({
  open,
  editingTrip,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trip-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editingTrip ? "Edit Trip" : "Add New Trip"}</h2>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            defaultValue={editingTrip?.destination || ""}
            required
          />

          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            defaultValue={editingTrip?.startDate || ""}
            required
          />

          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            defaultValue={editingTrip?.endDate || ""}
            required
          />

          <input
            type="number"
            name="budget"
            placeholder="Budget"
            defaultValue={editingTrip?.budget ?? ""}
            required
          />

          <select
            name="travelers"
            defaultValue={editingTrip?.travelers || "1 Person"}
          >
            <option value="1 Person">1 Person</option>
            <option value="2 People">2 People</option>
            <option value="3 People">3 People</option>
            <option value="4+ People">4+ People</option>
          </select>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              {editingTrip ? "Save Changes" : "Add Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}