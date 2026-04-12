import { useEffect, useState } from "react";
import { API_BASE, DATA_MODE } from "@/config";
import { loadTrips } from "@/utils/tripsStorage";

export default function TripDetailPage({tripId, onBack, onNavigateToPage, onEditTrip}) {
  
  const [trip, setTrip] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tripId) return;

    const controller = new AbortController();

    async function loadTrip() {
      try{
        setStatus('loading')
        setError("")

        //DEMO
        if (DATA_MODE === "demo") {
          const storedTrips = loadTrips();
          const foundTrip = storedTrips.find((t) => t.id === tripId);

          if (!foundTrip) {
            throw new Error("Trip not found");
          }

          setTrip(foundTrip);
          setStatus("success");
          return;
      }

        const response = await fetch(`${API_BASE}/trips/${tripId}`,
          { signal: controller.signal });

        if (!response.ok) {
          throw new Error('Failed to fetch trip details')
        }
        
        const data = await response.json();
        setTrip(data)
        setStatus('success')
      }catch(err){
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load trip details. Please try again later.')
        setStatus('error')
      }
    }
    loadTrip();
    return () => controller.abort();
  }, [tripId])


  if (status === 'loading' || status === 'idle') {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1>Couldn’t load trip</h1>
        </div>
        <div className="trip-info">
          <p style={{ color: "crimson" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-detail-page">
      <div className="trip-detail-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <button className="edit-btn" onClick={() => onEditTrip(trip)}>✏️ Edit</button>
        <h1> {trip.destination} Trip</h1>
      </div>

      <div className="trip-info">
        <p>Dates: {trip.startDate} - {trip.endDate}</p>
        <p>Budget: ${trip.budget}</p>
      </div>

      <div className="trip-options">
        <div className="option-card"
            onClick={()=> onNavigateToPage('todoList')}
            >📝 Todo List Preparation </div>
        <div className="option-card"
            onClick={()=> onNavigateToPage('budget')}
            >💰 Budget Management</div>
        <div className="option-card"
            onClick={()=> onNavigateToPage('TripCalendar')}
            >📅 Schedule</div>
        <div className="option-card"
            onClick={()=> onNavigateToPage('newWords')}
            >📚 New Words I Learned</div>
      </div>
    </div>

  )
}
