import tripsStore from '../data/trips.store.js';

const { getTrips, setTrips, findTripById, nextTripId } = tripsStore;

function getAllTrips(req, res) {
  const trips = getTrips().slice().sort((a, b) => b.id - a.id);
  res.json(trips);
}

function createTrip(req, res) {
  const { destination, startDate, endDate, budget, travelers } = req.body;

  if (!destination) {
    return res.status(400).json({ message: 'destination is required' });
  }

  const newTrip = {
    id: nextTripId(),
    destination,
    startDate,
    endDate,
    budget: Number(budget) || 0,
    travelers,
    todos: [],
    expenses: [],
    payers: []
  };

  const trips = getTrips();
  setTrips([newTrip, ...trips]);

  res.status(201).json(newTrip);
}

function getTripById(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);

  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  res.json(trip);
}

function patchTrip(req, res) {
  const tripId = Number(req.params.id);
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === tripId);

  if (index === -1) return res.status(404).json({ message: 'Trip not found' });

  trips[index] = { ...trips[index], ...req.body };
  setTrips(trips);

  res.status(200).json(trips[index]);
}

function deleteTrip(req, res) {
  const tripId = Number(req.params.id);
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === tripId);

  if (index === -1) return res.status(404).json({ message: 'Trip not found' });

  trips.splice(index, 1);
  setTrips(trips);

  res.status(204).end();
}

export default {
  getAllTrips,
  createTrip,
  getTripById,
  patchTrip,
  deleteTrip
};
