
function AddTripModal({ isOpen, editingTrip, onClose, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>   
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</h2>
            <form onSubmit={onSubmit}>
              <input 
                name="destination" 
                type="text" 
                placeholder="Destination" 
                defaultValue={editingTrip?.destination || ''}
                required 
              />
              <label>Start Date:</label>
              <input 
                name="startDate"
                type="text" 
                placeholder="DD/MM/YYYY (e.g., 15/03/2024)" 
                pattern="\d{2}/\d{2}/\d{4}"
                defaultValue={editingTrip?.startDate || ''}
                required
              />
              <label>End Date:</label>
              <input 
                name="endDate"
                type="text" 
                placeholder="DD/MM/YYYY (e.g., 22/03/2024)" 
                pattern="\d{2}/\d{2}/\d{4}"
                defaultValue={editingTrip?.endDate || ''}
                required
              />
              <input 
                name="budget" 
                type="number" 
                placeholder="Budget ($)" 
                defaultValue={editingTrip?.budget || ''}
              />
              <select name="travelers" defaultValue={editingTrip?.travelers || "1 Person"} required>
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
                  {editingTrip ? 'Save Changes' : 'Add Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


export default AddTripModal;