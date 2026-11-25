function getExpensesStorageKey(tripId) {
  return `travel_app_expenses_${tripId}`;
}

export function loadExpenses(tripId) {
  try {
    const raw = localStorage.getItem(getExpensesStorageKey(tripId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load expenses from localStorage:", error);
    return [];
  }
}

export function saveExpenses(tripId, expenses) {
  try {
    localStorage.setItem(getExpensesStorageKey(tripId), JSON.stringify(expenses));
  } catch (error) {
    console.error("Failed to save expenses to localStorage:", error);
  }
}

// Same calculation as calculateDays in the backend's expenses.controller.js,
// so demo mode and server mode show the same per-day cost.
function calculateDays(start, end) {
  if (!end) return 1;
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
}

export function withDailyCost(expense) {
  const amount = Number(expense.amount || 0);
  const totalDays = calculateDays(expense.startDate, expense.repeat ? expense.endDate : null);
  return {
    ...expense,
    amount,
    totalDays,
    costPerDayUSD: Number((amount / totalDays).toFixed(2)),
  };
}

export function getPayersSummary(expenses) {
  const totals = {};

  for (const exp of expenses) {
    const payer = (exp.paidBy || "").trim();
    if (!payer) continue;

    const amount = Number(exp.amount || 0);
    totals[payer] = (totals[payer] || 0) + amount;
  }

  return Object.entries(totals).map(([name, totalPaid]) => ({
    name,
    totalPaid: totalPaid.toFixed(2),
  }));
}