import { DATA_MODE } from "@/config";
import { loadExpenses } from "./expensesStorage";
import { loadTodos } from "./todoStorage";
import { loadEvents } from "./eventsStorage";
import { parseTripDate, tripLength, tripStatus } from "./dates";

// Where a trip's related data lives depends on the mode: in demo mode it's
// in localStorage, with the server it comes back nested on the trip object.
function tripData(trip) {
  if (DATA_MODE === "demo") {
    return {
      expenses: loadExpenses(trip.id),
      todos: loadTodos(trip.id),
      events: loadEvents(trip.id),
    };
  }
  return {
    expenses: trip.expenses ?? [],
    todos: trip.todos ?? [],
    events: trip.events ?? [],
  };
}

function eventStart(event) {
  const d = new Date(event.start);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Everything the home cards and the trip dashboard show, computed in one place.
export function summarizeTrip(trip, now = new Date()) {
  const { expenses, todos, events } = tripData(trip);
  const start = parseTripDate(trip.startDate);
  const end = parseTripDate(trip.endDate);

  // Note: amounts are summed as entered. Mixed currencies aren't converted
  // (the budget page does the same today).
  const spent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const budget = Number(trip.budget) || 0;

  const openTodos = todos.filter((t) => !t.completed).length;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextEvent =
    events
      .map((e) => ({ ...e, startDate: eventStart(e) }))
      .filter((e) => e.startDate && e.startDate >= startOfToday)
      .sort((a, b) => a.startDate - b.startDate)[0] ?? null;

  return {
    start,
    end,
    length: tripLength(start, end),
    status: tripStatus(trip, now),
    budget,
    spent,
    remaining: budget - spent,
    budgetUsedPct: budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : null,
    overBudget: budget > 0 && spent > budget,
    todosTotal: todos.length,
    openTodos,
    eventsTotal: events.length,
    nextEvent,
  };
}

export function formatMoney(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
