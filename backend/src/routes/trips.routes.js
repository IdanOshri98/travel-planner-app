import express from 'express';
import tripsCtrl from '../controllers/trips.controller.js';
import todosCtrl from '../controllers/todos.controller.js';
import expensesCtrl from '../controllers/expenses.controller.js';
import wordsCtrl from '../controllers/newWords.controller.js'
import eventsCtrl from '../controllers/events.controller.js';

const router = express.Router();



// Trips
router.get('/', tripsCtrl.getAllTrips);
router.post('/', tripsCtrl.createTrip);
router.get('/:id', tripsCtrl.getTripById);
router.patch('/:id', tripsCtrl.patchTrip);
router.delete('/:id', tripsCtrl.deleteTrip);

// Todos (nested)
router.post('/:id/todos', todosCtrl.createTodo);
router.get('/:id/todos', todosCtrl.getTodos);
router.patch('/:tripId/todos/:todoId', todosCtrl.patchTodo);
router.delete('/:tripId/todos/:todoId', todosCtrl.deleteTodo);



// Expenses (nested)
router.post('/:id/expenses', expensesCtrl.createExpense);
router.get('/:id/expenses', expensesCtrl.getExpenses);
router.patch('/:tripId/expenses/:expenseId', expensesCtrl.patchExpense);
router.delete('/:tripId/expenses/:expenseId', expensesCtrl.deleteExpense);
router.get('/:id/payers', expensesCtrl.getPayers);


// Words
router.post('/:id/words', wordsCtrl.createWord);
router.get('/:id/words', wordsCtrl.getWords);
router.patch('/:tripId/words/:wordId', wordsCtrl.editWord);
router.delete('/:tripId/words/:wordId', wordsCtrl.deleteWord);


// Calendar events (nested: each trip has its own)
router.get('/:id/events', eventsCtrl.getEvents);
router.post('/:id/events', eventsCtrl.createEvent);
router.delete('/:tripId/events/:eventId', eventsCtrl.deleteEvent);


export default router;