import { useState, useEffect } from 'react';
import { API_BASE, DATA_MODE } from '@/config';
import { loadTrips, saveTrips } from '@/utils/tripsStorage';

// Everything else saved for a trip in demo mode. Removed together with the
// trip, so deleted trips don't leave orphaned data in localStorage.
const TRIP_STORAGE_PREFIXES = ['travel_app_todos_', 'travel_app_expenses_', 'travel_app_events_'];

function removeTripData(id) {
  try {
    TRIP_STORAGE_PREFIXES.forEach((prefix) => localStorage.removeItem(prefix + id));
    sessionStorage.removeItem(`travel_chat_${id}`);
  } catch {
    // storage unavailable: nothing to clean
  }
}

export function useTrips() {
  // In demo mode the trips are read synchronously on the first render, so a
  // page like /trips/:id never sees an empty list and wrongly says "not found".
  const [trips, setTrips] = useState(() => (DATA_MODE === 'demo' ? loadTrips() : []));
  const [status, setStatus] = useState(DATA_MODE === 'demo' ? 'ready' : 'loading');

  useEffect(() => {
    if (DATA_MODE === 'demo') return;

    fetch(`${API_BASE}/trips`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch trips');
        return res.json();
      })
      .then((data) => {
        setTrips(data);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Error fetching trips:', err);
        setStatus('error');
      });
  }, [])


  const addTrip = async (newTrip) => {
    

    //Demo
    if (DATA_MODE === 'demo') {
      const updatedTrips = [newTrip, ...trips];
      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      return newTrip;
    }

    try {
      // Send new trip data to the backend API
      const response = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTrip)
      })
      if (!response.ok) throw new Error('Failed to add trip');
 
      const savedTrip = await response.json();
      setTrips(prev => [savedTrip, ...prev])
      return savedTrip;
   } catch (error) {
      console.error('Error adding trip:', error)
      return null;
    }
  }




  // The hook only manages trip data. UI state (which modal is open, which
  // screen is shown) belongs to the component that calls it, so these
  // functions return true/false and let the caller decide what to do next.
  const editTrip = async (id, editedTrip) => {
    if (DATA_MODE === 'demo') {
      const updatedTrips = trips.map((trip) =>
        trip.id === id ? { ...trip, ...editedTrip } : trip
      );

      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      return true;
    }

    try {
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedTrip)
      });

      if(!response.ok) throw new Error('Failed to update trip')

      const updated = await response.json();
      setTrips(prev => prev.map(trip => (trip.id === updated.id ? updated : trip)))
      return true;
    }
    catch (error) {
      console.error('Error updating trip:', error)
      return false;
    }
  }



  const deleteTrip = async (id) => {

    if (DATA_MODE === 'demo') {
      const updatedTrips = trips.filter((trip) => trip.id !== id);
      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      removeTripData(id);
      return true;
    }

    try{
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'DELETE'
      });

      if(!response.ok)  throw new Error('Failed to delete trip')
      
      setTrips(prev => prev.filter(trip => trip.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error)
      return false;
    }
  }
  return { trips, status, addTrip, editTrip, deleteTrip }

}