import express from 'express';
import tripsCtrl from '../controllers/trips.controller.js';
import todosCtrl from '../controllers/todos.controller.js';
import expensesCtrl from '../controllers/expenses.controller.js';

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


export default router;