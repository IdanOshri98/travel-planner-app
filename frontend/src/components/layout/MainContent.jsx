import TripDetailPage from '../pages/TripDetailPage';
import TodoListPage from '../pages/TodoList';
import BudgetManagement from '../pages/Budget';
import TripCalendar from "../pages/TripCalendar";
import NewWordsPage from "../pages/newWords";
import HomePage from '../pages/HomePage';



function MainContent({ currentView, currentTripPage, trips,
                       currentTripId, setCurrentView, setCurrentTripPage,
                       setEditingTrip, selectTrip, handleDeleteTrip,
                      openAddTripModal, openConversation, setShowAddTripModal, setShowConversation }) {
  if (currentView === 'home') 
      return  <HomePage 
                        trips={trips}
                        openAddTripModal={openAddTripModal}
                        openConversation={openConversation}
                        selectTrip={selectTrip}
                        handleDeleteTrip={handleDeleteTrip}
                        setEditingTrip={setEditingTrip}
                        setShowAddTripModal={setShowAddTripModal}
                        setShowConversation={setShowConversation}
                />;    

  else if (currentView === 'tripDetail') {
    switch (currentTripPage) {
      case 'overview':
          return (
            <TripDetailPage 
                tripId={currentTripId} 
                onBack={() => setCurrentView('home')}
                onNavigateToPage={setCurrentTripPage}
                onEditTrip={(trip) => {
                  setEditingTrip(trip)
                  setShowAddTripModal(true)
                }}
              />
          )

        case 'todoList':
          return (
            <TodoListPage 
              trip={trips.find(t => t.id === currentTripId)} 
              onBack={() => setCurrentTripPage('overview')}
            />
          )

        case 'budget':
          return (
            <BudgetManagement
              trip={trips.find(t => t.id === currentTripId)} 
              onBack={() => setCurrentTripPage('overview')} 
            />
          )

          case 'TripCalendar':
            return (
              <TripCalendar
                trip={trips.find(t => t.id === currentTripId)} 
                onBack={() => setCurrentTripPage('overview')} 
              />
            )

          case 'newWords':
            return (
              <NewWordsPage
                trip={trips.find(t => t.id === currentTripId)} 
                onBack={() => setCurrentTripPage('overview')} 
              /> 
            )
    }
  }

  return null;
}

export default MainContent;