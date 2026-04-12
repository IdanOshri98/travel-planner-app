 function TripList({
                    trips,
                    onAddTrip,
                    onSelectTrip,
                    onEditTrip,
                    onDeleteTrip,
                    onConversation
                  }) {

  return (
    
      <div className={`tripLits `}>
        <button className="add-trip-btn"
        onClick={onAddTrip}
        >
          + Add Trip </button>
        <div className="trips-list">
          {trips.map((trip, index) => (
            <div 
                key={trip.id || index}
                className="trip-item"
                onClick={() => {  onSelectTrip(trip.id)  }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                <span> ✈️ {trip.destination} </span>
                <div className="trip-actions">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTrip(trip)
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTrip(trip.id)
                    }}
                  >
                    🗑️
                  </button>
                  <button
                    className="conversation-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onConversation(trip)
                    }}
                  >
                    💬
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    );
}

export default TripList;