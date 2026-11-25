import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useMatch, useParams, useLocation } from 'react-router';
import ToastContainer from "./components/pages/ToastContainer";
import AppHeader from './components/layout/AppHeader';
import ChatLauncher from './components/layout/ChatLauncher';
import AddTripModal from './components/pages/AddTripModal';
import ConfirmDialog from './components/ui/ConfirmDialog';
import HomePage from './components/pages/HomePage';
import TripDetailPage from './components/pages/TripDetailPage';
import TodoListPage from './components/pages/TodoList';
import BudgetManagement from './components/pages/Budget';
import TripCalendar from './components/pages/TripCalendar';
import NewWordsPage from './components/pages/newWords';
import NotFound from './components/pages/NotFound';
import ConversationMode from '@/components/pages/ConversationMode';
import { useTrips } from './hooks/useTrips';
import useToastStore from './store/useToastStore';

// ===== Base styles =====
import './styles/base/reset.css';
import './styles/base/variables.css';
import './styles/base/typography.css';
import './styles/base/layout.css';

// ===== Layout =====
import './styles/layout/header.css';
import './styles/layout/responsive.css';

// ===== Components =====
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/modals.css';
import './styles/components/cards.css';
import './styles/components/animations.css';

// ===== Pages =====
import './styles/pages/trip-detail.css';
import './styles/pages/budget.css';
import './styles/pages/todo.css';
import "./styles/pages/calendar.css";
import "./styles/pages/newWords.css";
import "./styles/pages/homePage.css";
import "./styles/pages/conversationMode.css";

// Finds the trip named in the URL (/trips/:tripId/...) and renders the page
// for it, or a loading / not-found state. Every trip page goes through here,
// so the trip always comes from the same shared list (no stale copies).
function TripRoute({ trips, status, render }) {
  const { tripId } = useParams();
  const trip = trips.find((t) => String(t.id) === tripId);

  if (!trip && status === 'loading') {
    return (
      <main className="page" aria-busy="true">
        <div className="state-box"><p>Loading trip…</p></div>
      </main>
    );
  }
  if (!trip) {
    return <NotFound title="Trip not found" message="It may have been deleted, or the link is wrong." />;
  }
  return render(trip);
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useToastStore((state) => state.addToast);
  const { trips, status, addTrip, editTrip, deleteTrip } = useTrips();

  const [tripForm, setTripForm] = useState({ open: false, trip: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [chat, setChat] = useState({ open: false, tripId: null });

  // The trip in the URL, if any. Used as the chat's default trip.
  const tripMatch = useMatch('/trips/:tripId/*');
  const urlTripId = tripMatch?.params.tripId ?? null;

  // New page = start at the top (a client-side navigation keeps the old scroll).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const openNewTrip = useCallback(() => setTripForm({ open: true, trip: null }), []);
  const openEditTrip = useCallback((trip) => setTripForm({ open: true, trip }), []);
  const closeTripForm = useCallback(() => setTripForm({ open: false, trip: null }), []);

  const saveTrip = async (fields) => {
    if (tripForm.trip) {
      const ok = await editTrip(tripForm.trip.id, fields);
      if (ok) {
        closeTripForm();
        addToast({ message: 'Trip updated', type: 'success' });
      }
      return ok;
    }

    const created = await addTrip({ id: crypto.randomUUID(), ...fields });
    if (created) {
      closeTripForm();
      addToast({ message: 'Trip created', type: 'success' });
      navigate(`/trips/${created.id}`);
    }
    return Boolean(created);
  };

  const confirmDelete = async () => {
    const trip = pendingDelete;
    setPendingDelete(null);
    const ok = await deleteTrip(trip.id);
    if (!ok) {
      addToast({ message: "Couldn't delete the trip", type: 'error' });
      return;
    }
    addToast({ message: `${trip.destination} deleted`, type: 'success' });
    // If we were inside the deleted trip, go back to the list.
    if (String(trip.id) === urlTripId) navigate('/');
    if (String(trip.id) === String(chat.tripId)) setChat({ open: false, tripId: null });
  };
  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  const openChat = useCallback((trip) => setChat({ open: true, tripId: trip?.id ?? urlTripId }), [urlTripId]);
  const closeChat = useCallback(() => setChat((c) => ({ ...c, open: false })), []);

  const chatTrip = trips.find((t) => String(t.id) === String(chat.tripId));

  const tripPage = (render) => <TripRoute trips={trips} status={status} render={render} />;
  const backTo = (trip) => () => navigate(`/trips/${trip.id}`);

  return (
    <div className="app">
      <ToastContainer />
      <AppHeader onNewTrip={openNewTrip} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              trips={trips}
              status={status}
              onAddTrip={openNewTrip}
              onEditTrip={openEditTrip}
              onDeleteTrip={setPendingDelete}
              onChat={openChat}
            />
          }
        />
        <Route
          path="/trips/:tripId"
          element={tripPage((trip) => <TripDetailPage trip={trip} onEditTrip={openEditTrip} onChat={openChat} />)}
        />
        <Route
          path="/trips/:tripId/todos"
          element={tripPage((trip) => <TodoListPage trip={trip} onBack={backTo(trip)} />)}
        />
        <Route
          path="/trips/:tripId/budget"
          element={tripPage((trip) => <BudgetManagement trip={trip} onBack={backTo(trip)} />)}
        />
        <Route
          path="/trips/:tripId/schedule"
          element={tripPage((trip) => <TripCalendar trip={trip} onBack={backTo(trip)} />)}
        />
        <Route
          path="/trips/:tripId/words"
          element={tripPage((trip) => <NewWordsPage trip={trip} onBack={backTo(trip)} />)}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <AddTripModal
        isOpen={tripForm.open}
        editingTrip={tripForm.trip}
        onClose={closeTripForm}
        onSave={saveTrip}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.destination ?? 'this trip'}?`}
        message="Its budget, to-dos and schedule will be deleted too. This can't be undone."
        confirmLabel="Delete trip"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ChatLauncher onClick={() => openChat()} hidden={chat.open} />

      <ConversationMode
        isOpen={chat.open}
        onClose={closeChat}
        destination={chatTrip?.destination}
        chatKey={chatTrip ? String(chatTrip.id) : 'general'}
      />
    </div>
  );
}

export default App
