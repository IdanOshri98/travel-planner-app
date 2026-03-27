import { API_BASE } from "../config";

export async function fetchExpenses(tripId) {
  const response = await fetch(`${API_BASE}/trips/${tripId}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

export async function createExpense(tripId, expenseData) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(expenseData)
      })

    if(!response.ok)  throw new Error('Failed to add expense')
    return response.json();
}

export async function updateExpense(tripId, expenseId, expenseData) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(expenseData)
      })
    if(!response.ok) throw new Error('Failed to toggle expense')

    return response.json();
}

export async function removeExpense(tripId, expenseId) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`,
        {  method: 'DELETE'  } )

    if(!response.ok) throw new Error('Failed to delete expense')
}

export async function fetchPayersSummary(tripId) {
    const response = await fetch(`${API_BASE}/trips/${tripId}/payers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
      })

      if(!response.ok)  throw new Error('Failed to get payers')

      return await response.json();
}


      
