import { useState, useEffect } from 'react'

// ===== סטיילים בסיסיים =====
import './styles/base/reset.css';
import './styles/base/variables.css';
import './styles/base/typography.css';
import './styles/base/layout.css';

// ===== מבנה עמוד =====
import './styles/layout/header.css';
import './styles/layout/sidebar.css';
import './styles/layout/responsive.css';

// ===== רכיבים =====
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/modals.css';
import './styles/components/cards.css';
import './styles/components/animations.css';

// ===== עמודים =====
import './styles/pages/trip-detail.css';
import './styles/pages/budget.css';
import './styles/pages/todo.css';

// ייבוא הקומפוננטים - נתיבים מתוקנים
import TripDetailPage from './pages/TripDetailPage'
import TodoListPage from './pages/TodoList'
import BudgetManagement from './pages/Budget'




function App() {
  // State for sidebar open/closed
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddTripModal, setShowAddTripModal] = useState(false)
  const [currentTripId, setCurrentTripId] = useState(null)
  const [currentView, setCurrentView] = useState('home') 
  const [currentTripPage, setCurrentTripPage] = useState('overview') 
  const [editingTrip, setEditingTrip] = useState(null)

  // Sample trips data
  const [trips, setTrips] = useState([])

  useEffect(() => {
    // Fetch trips data from an API or local storage if needed
    fetch('http://localhost:5000/trips')
      .then(res => res.json())
      .then(data => setTrips(data))
      .catch(err => console.error('Error fetching trips:', err))
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleAddTrip = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newTrip = {
      destination: formData.get('destination'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      budget: Number(formData.get('budget')),
      travelers: formData.get('travelers')
    }

    try {
      // Send new trip data to the backend API
      const response = await fetch('http://localhost:5000/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTrip)
      }) 
      const savedTrip = await response.json();

      setTrips(prev => [savedTrip, ...prev])
      setShowAddTripModal(false)
   } catch (error) {
      console.error('Error adding trip:', error)
    }
  }




  const handleEditTrip = async (e) => {    //////אולי להוריד את זה בהמשך - אני לא רוצה לאפשר עריכה כאן
    e.preventDefault()
    const formData = new FormData(e.target)
    const updatedTrip = {
      destination: formData.get('destination'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      budget: Number(formData.get('budget')),
      travelers: formData.get('travelers')
    }

    try {
      const response = await fetch(`http://localhost:5000/trips/${editingTrip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTrip)
      });

      if(!response.ok) throw new Error('Failed to update trip')

      const updated = await response.json();

      setTrips(prev => prev.map(trip => (trip.id === updated.id ? updated : trip)))
      setEditingTrip(null)
      setShowAddTripModal(false)
    }
    catch (error) {
      console.error('Error updating trip:', error)
    }
  }



  const handleDeleteTrip = async (id) => {

    if (!window.confirm('Delete this trip?')) return;

    try{
      const response = await fetch(`http://localhost:5000/trips/${id}`, {
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


  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="website-name">MY AWESOME TRAVEL APP</h1>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="add-trip-btn"
        onClick={() => 
          {setEditingTrip(null);
          setShowAddTripModal(true)}}
        >
          + Add Trip </button>
        <div className="trips-list">
          {trips.map(trip => (
            <div 
                key={trip.id}
                className="trip-item"
                onClick={() => {
                  setCurrentTripId(trip.id)
                  setCurrentView('tripDetail')
                  setSidebarOpen(false) 
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                <span> 🌍{trip.destination} </span>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTrip(trip.id)
                  }}
                >
                  🗑️
                </button>
            </div>
          ))}
        </div>
      </aside>

      
      {/* Main Map Area */}
      {currentView === 'home' ? (
        <main className="map-area">
          <img 
              src="/worldmap.png" 
              alt="World Map" 
              className="world-map-image"
          />
        </main>
      ) : currentView === 'tripDetail' ? (
          currentTripPage === 'overview' ? (
            <TripDetailPage 
              tripId={currentTripId} 
              onBack={() => setCurrentView('home')}
              onNavigateToPage={setCurrentTripPage}
              onEditTrip={(trip) => {
                setEditingTrip(trip)
                setShowAddTripModal(true)
              }}
            />
          ) : currentTripPage === 'todoList' ? (
            <TodoListPage 
              trip={trips.find(t => t.id === currentTripId)} 
              onBack={() => setCurrentTripPage('overview')}
            />
          ) : currentTripPage === 'budget' ? (
            <BudgetManagement
              trip={trips.find(t => t.id === currentTripId)} 
              onBack={() => setCurrentTripPage('overview')} 
            />
          ) : currentTripPage === 'TripCalendar' ? (
            <TripCalendar
              trip={trips.find(t => t.id === currentTripId)} 
              onBack={() => setCurrentTripPage('overview')} 
            />
          ) :null
      ) : null}

      {/* Add Trip Modal */}
      {showAddTripModal && (
        <div className="modal-overlay" onClick={() => setShowAddTripModal(false)}>   
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</h2>
            <form onSubmit={editingTrip ? handleEditTrip : handleAddTrip}>
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
                <button type="button" onClick={() => setShowAddTripModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Add Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App