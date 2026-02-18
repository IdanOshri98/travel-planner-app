import tripsStore from '../data/trips.store.js';
const { findTripById, nextExpenseId } = tripsStore;

const calculateDays = (start, end) => {
    if (!end) return 1
    return Math.ceil((new Date(end) - new Date(start))/ (1000 * 60 * 60 * 24)) + 1
}

function createExpense(req, res) {
  console.log("here");
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });


  const {
    description,
    amount,
    currency,
    startDate,
    endDate,
    repeat,
    category,
    payedBy
  }= req.body;
  
  if (!description) return res.status(400).json({ message: 'title is required' });

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount < 0) {
    return res.status(400).json({ message: 'amount must be a non-negative number' });
  }

  if (!startDate) return res.status(400).json({ message: 'startDate is required' });

  const totalDays = calculateDays(startDate, repeat ? endDate : null);
  //const costPerDayUSD = Number((numAmount / totalDays).toFixed(2));

  const costPerDayUSD = Number((numAmount / totalDays).toFixed(2));

  if (!Array.isArray(trip.expenses)) trip.expenses = [];
  if (!Array.isArray(trip.payers)) trip.payers = [];


  const newExpense = {
    id: nextExpenseId(trip),
    description,
    amount: numAmount,
    currency,
    startDate,
    endDate,
    repeat,
    category,
    payedBy,
    totalDays,
    costPerDayUSD,
  }

  trip.expenses.push(newExpense);
  if (!trip.payers.some(p => p.name === payedBy)) {
    trip.payers.push({ name: payedBy, totalPaid: numAmount });}
  else {
    const payer = trip.payers.find(p => p.name === payedBy);
    payer.totalPaid += numAmount;
  }

  res.status(201).json(newExpense);
}

function getExpenses(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  
  if (!Array.isArray(trip.expenses)) trip.expenses = [];
  res.status(200).json(trip.expenses);
}

function patchExpense(req, res) {
  const tripId = Number(req.params.tripId);
  const expenseId = Number(req.params.expenseId);

  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  if (!Array.isArray(trip.expenses)) trip.expenses = [];

  const idx = trip.expenses.findIndex(e => e.id === expenseId);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });

  
  const patch = { ...req.body };
  if (patch.amount !== undefined) {
    const numAmount = Number(patch.amount);
    if (!Number.isFinite(numAmount) || numAmount < 0) {
      return res.status(400).json({ message: 'amount must be a non-negative number' });
    }
    patch.amount = numAmount;
  }

  const updatedExpense = { ...trip.expenses[idx], ...patch };

  const amountChanged = patch.amount !== undefined;
  const datesChanged = patch.startDate !== undefined
                    || patch.endDate !== undefined
                    || patch.repeat !== undefined;

  if (amountChanged || datesChanged) {
    const totalDays = calculateDays(updatedExpense.startDate, updatedExpense.repeat ? updatedExpense.endDate : null);
    updatedExpense.totalDays = totalDays;
    updatedExpense.costPerDayUSD = Number((updatedExpense.amount / totalDays).toFixed(2));
  }

  trip.expenses[idx] = { ...trip.expenses[idx], ...patch };
  recomputePayers(trip);
  res.json(updatedExpense);
}

function deleteExpense(req, res) {
  const tripId = Number(req.params.tripId);
  const expenseId = Number(req.params.expenseId);

  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const idx = trip.expenses.findIndex(e => e.id === expenseId);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });

  trip.expenses.splice(idx, 1);
  recomputePayers(trip);
  res.status(204).end();
}

function getPayers(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  if (!Array.isArray(trip.payers)) trip.payers = [];
  res.status(200).json(trip.payers);
}

function recomputePayers(trip) {
  const updatePayers = new Map();

  for (const exp of (trip.expenses || [])) {
    const name = (exp.payedBy || '').trim();
    if (!name) continue;

    const amount = Number(exp.amount);
    if (!Number.isFinite(amount)) continue;

    updatePayers.set(name, (updatePayers.get(name) || 0) + amount);
  }

  trip.payers = Array.from(updatePayers, ([name, totalPaid]) => ({ name, totalPaid }));
}


export default { createExpense, getExpenses, patchExpense, deleteExpense, getPayers };
