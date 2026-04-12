import DailyFact from "@/components/layout/DailyFact";
import TripList from '@/components/layout/TripList';

function HomePage({ trips,
                    openAddTripModal,
                    selectTrip,
                    handleDeleteTrip,
                    setEditingTrip,
                    openConversation,
                    setShowAddTripModal, setShowConversation }) {

  return (
    <main className="home-container">
      <section className="home-hero">
        <h1>🌍 Plan Your Next Adventure 🌍</h1>
        <p>
          Organize trips, manage your budget, and discover something new every day.
        </p>
      </section>

      <section className="home-content">
        <DailyFact />
      </section>

      <section className="home-trips-section">
        <h2>Your Trips</h2>

        <TripList
            trips={trips}
            onAddTrip={openAddTripModal}
            onSelectTrip={selectTrip}
            onEditTrip={(trip) => {
              setEditingTrip(trip);
              setShowAddTripModal(true);
            }}
            onConversation={(trip) => {
              setShowConversation(true);
              openConversation(trip)
            }}
            onDeleteTrip={handleDeleteTrip}
            openConversation={openConversation}
          />
      </section>
    </main>
  );
}

export default HomePage;