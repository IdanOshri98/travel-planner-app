import { useState, useEffect } from 'react';
import ToastContainer from "./components/pages/ToastContainer";
import AppHeader from './components/layout/AppHeader';
import AddTripModal from './components/pages/AddTripModal';
import MainContent from './components/layout/MainContent';

import ConversationMode from '@/components/pages/ConversationMode';
import { useTrips } from './hooks/useTrips';


// ===== סטיילים בסיסיים =====
import './styles/base/reset.css';
import './styles/base/variables.css';
import './styles/base/typography.css';
import './styles/base/layout.css';

// ===== מבנה עמוד =====
import './styles/layout/header.css';
import './styles/layout/tripList.css';
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
import "./styles/pages/calendar.css";
import "./styles/pages/newWords.css";
import "./styles/pages/homePage.css";
import "./styles/pages/conversationMode.css";



function App() {
  // State for sidebar open/closed
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [currentTripPage, setCurrentTripPage] = useState('overview');
  const [editingTrip, setEditingTrip] = useState(null);
  const { trips, addTrip, editTrip, deleteTrip } = useTrips();

  const [showConversation, setShowConversation] = useState(false);





  const handleAddTrip = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newTrip = {
      id: crypto.randomUUID(),
      destination: formData.get('destination'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      budget: Number(formData.get('budget')),
      travelers: formData.get('travelers')
    }

    addTrip(newTrip)
    setShowAddTripModal(false)
  };




  const handleEditTrip = async (e) => {    
    e.preventDefault()
    const formData = new FormData(e.target)
    const updatedTrip = {
      destination: formData.get('destination'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      budget: Number(formData.get('budget')),
      travelers: formData.get('travelers')
    }

    editTrip(editingTrip.id, updatedTrip);
    setShowAddTripModal(false);
    setEditingTrip(null);
  }
  


  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    deleteTrip(id)
  };


  const openAddTripModal = () => {
      setEditingTrip(null);
      setShowAddTripModal(true);
  };

  const openConversation = (trip) => {
    console.log("openConversation clicked");
      setCurrentTripId(trip.id);
      setShowConversation(true);
  };

  const selectTrip = (id) => {
    setCurrentTripId(id);
    setCurrentView('tripDetail');
  };

console.log("showConversation:", showConversation);
  return (
    <div className="app">
      <ToastContainer />

      <AppHeader  />
      
      {/* Main Map Area */}
      <MainContent
        currentView={currentView}
        currentTripPage={currentTripPage}
        trips={trips}
        currentTripId={currentTripId}
        setCurrentView={setCurrentView}
        setCurrentTripPage={setCurrentTripPage}
        setEditingTrip={setEditingTrip}
        selectTrip={selectTrip}
        handleDeleteTrip={handleDeleteTrip}
        setShowAddTripModal={setShowAddTripModal}
        setShowConversation={setShowConversation}
        openAddTripModal={openAddTripModal}
        openConversation={openConversation}
      />

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={showAddTripModal}
        editingTrip={editingTrip}
        onClose={() => setShowAddTripModal(false)}
        onSubmit={editingTrip ? handleEditTrip : handleAddTrip}
      />

      <ConversationMode
        isOpen={showConversation}
        onClose={() => setShowConversation(false)}
        destination={trips.find(t => t.id === currentTripId)?.destination}
      />
      
    </div>
  )
}

export default App