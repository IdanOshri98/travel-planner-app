let trips = [
    { id: 1, destination: 'Thailand', todos: [], expenses: [], payers: [] },
    { id: 2, destination: 'Mexico', todos: [], expenses: [], payers: [] }
];

export function getTrips() {
    return trips;
}

export function setTrips(newTrips) {
    trips = newTrips;
}

export function findTripById(id) {
  return trips.find(t => t.id === id);
}

export function nextTripId() {
  return trips.length ? Math.max(...trips.map(t => t.id)) + 1 : 1;
}

export function nextTodoId(trip) {
  return trip.todos.length ? Math.max(...trip.todos.map(t => t.id)) + 1 : 1;
}

export function nextExpenseId(trip) {
  return trip.expenses.length ? Math.max(...trip.expenses.map(e => e.id)) + 1 : 1;
}

export function setPayers(payers) {
  setPayers(payers);
}

export default {
  getTrips,
  setTrips,
  findTripById,
  nextTripId,
  nextTodoId,
  nextExpenseId
};