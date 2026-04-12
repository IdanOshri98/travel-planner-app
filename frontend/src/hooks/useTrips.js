import { useState, useEffect } from 'react';
import { API_BASE, DATA_MODE } from '@/config';
import { loadTrips, saveTrips } from '@/utils/tripsStorage';

export function useTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    //Demo
    if (DATA_MODE === 'demo') {
      const storedTrips = loadTrips();
      setTrips(storedTrips);
      return;
  }

    // Fetch trips data from an API or local storage if needed
    fetch(`${API_BASE}/trips`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch trips');
        return res.json();
      })
      .then(data => setTrips(data))
      .catch(err => console.error('Error fetching trips:', err))
  }, [])


  const addTrip = async (newTrip) => {
    

    //Demo
    if (DATA_MODE === 'demo') {
      const updatedTrips = [newTrip, ...trips];
      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      return;
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
   } catch (error) {
      console.error('Error adding trip:', error)
    }
  }




  const editTrip = async (id, editedTrip) => {    //////אולי להוריד את זה בהמשך - אני לא רוצה לאפשר עריכה כאן
    
    if (DATA_MODE === 'demo') {
      const updatedTrips = trips.map((trip) =>
        trip.id === id ? { ...trip, ...editedTrip } : trip
      );

      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      setEditingTrip(null);
      return;
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
      setEditingTrip(null)
    }
    catch (error) {
      console.error('Error updating trip:', error)
    }
  }



  const deleteTrip = async (id) => {

    if (DATA_MODE === 'demo') {
      const updatedTrips = trips.filter((trip) => trip.id !== id);
      setTrips(updatedTrips);
      saveTrips(updatedTrips);

      if (currentTripId === id) {
        setCurrentTripId(null);
        setCurrentView('home');
        setCurrentTripPage('overview');
      }
      return;
    }

    try{
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'DELETE'
      });

      if(!response.ok)  throw new Error('Failed to delete trip')
      
      setTrips(prev => prev.filter(trip => trip.id !== id));

      if(currentTripId === id) {
        setCurrentTripId(null)
        setCurrentView('home')
        setCurrentTripPage('overview')
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }
  return { trips, addTrip, editTrip, deleteTrip }

}