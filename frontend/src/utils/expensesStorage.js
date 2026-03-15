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

export function getPayersSummary(expenses) {
  const totals = {};

  for (const exp of expenses) {
    const payer = (exp.payedBy || "").trim();
    if (!payer) continue;

    const amount = Number(exp.amount || 0);
    totals[payer] = (totals[payer] || 0) + amount;
  }

  return Object.entries(totals).map(([name, totalPaid]) => ({
    name,
    totalPaid: totalPaid.toFixed(2),
  }));
}