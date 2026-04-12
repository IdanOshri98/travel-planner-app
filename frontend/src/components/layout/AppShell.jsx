import { useMemo, useState } from "react";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import TripFormModal from "./TripFormModal";
import useTrips from "../../hooks/useTrips";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [currentTripPage, setCurrentTripPage] = useState("overview");
  const [editingTrip, setEditingTrip] = useState(null);

  const { trips, addTrip, editTrip, deleteTrip } = useTrips({
    currentTripId,
    onDeletedCurrentTrip: () => {
      setCurrentTripId(null);
      setCurrentView("home");
      setCurrentTripPage("overview");
    },
  });

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === currentTripId) || null,
    [trips, currentTripId]
  );

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenAddTripModal = () => {
    setEditingTrip(null);
    setShowAddTripModal(true);
  };

  const handleSelectTrip = (tripId) => {
    setCurrentTripId(tripId);
    setCurrentView("tripDetail");
    setCurrentTripPage("overview");
    setSidebarOpen(false);
  };

  const handleEditTripClick = (trip) => {
    setEditingTrip(trip);
    setShowAddTripModal(true);
  };

  const handleCloseModal = () => {
    setEditingTrip(null);
    setShowAddTripModal(false);
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();

    try {
      if (editingTrip) {
        await editTrip(editingTrip, e.target);
      } else {
        const createdTrip = await addTrip(e.target);
        setCurrentTripId(createdTrip.id);
        setCurrentView("tripDetail");
        setCurrentTripPage("overview");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Trip submit error:", error);
    }
  };

  return (
    <>
      <AppHeader onToggleSidebar={handleToggleSidebar} />

      <Sidebar
        trips={trips}
        sidebarOpen={sidebarOpen}
        onAddTrip={handleOpenAddTripModal}
        onSelectTrip={handleSelectTrip}
        onDeleteTrip={deleteTrip}
      />

      <MainContent
        currentView={currentView}
        currentTripPage={currentTripPage}
        selectedTrip={selectedTrip}
        currentTripId={currentTripId}
        onGoHome={() => setCurrentView("home")}
        onNavigateToPage={setCurrentTripPage}
        onEditTrip={handleEditTripClick}
      />

      <TripFormModal
        open={showAddTripModal}
        editingTrip={editingTrip}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTrip}
      />
    </>
  );
}