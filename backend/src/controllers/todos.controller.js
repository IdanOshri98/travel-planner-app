import tripsStore from '../data/trips.store.js';
const { findTripById, nextTodoId } = tripsStore;

function createTodo(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text is required' });

  const newTodo = { id: nextTodoId(trip), text, completed: false };
  
  trip.todos.push(newTodo);
  res.status(201).json(newTodo);
}

function getTodos(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  res.status(200).json(trip.todos);
}

function patchTodo(req, res) {
  const tripId = Number(req.params.tripId);
  const todoId = Number(req.params.todoId);

  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const idx = trip.todos.findIndex(t => t.id === todoId);
  if (idx === -1) return res.status(404).json({ message: 'Todo not found' });

  trip.todos[idx] = { ...trip.todos[idx], ...req.body };
  res.json(trip.todos[idx]);
}

function deleteTodo(req, res) {
  const tripId = Number(req.params.tripId);
  const todoId = Number(req.params.todoId);

  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const idx = trip.todos.findIndex(t => t.id === todoId);
  if (idx === -1) return res.status(404).json({ message: 'Todo not found' });

  trip.todos.splice(idx, 1);
  res.status(204).end();
}

export default { getTodos, createTodo, patchTodo, deleteTodo };
