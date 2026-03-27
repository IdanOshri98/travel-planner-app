import { create } from "zustand";

const useExpenseStore = create((set) => ({
  expensesByTrip: {},
  payersByTrip: {},

  setExpenses: (tripId, expenses) =>
    set((state) => ({
      expensesByTrip: {
        ...state.expensesByTrip,
        [tripId]: expenses,
      },
    })),

  setPayers: (tripId, payers) =>
    set((state) => ({
      payersByTrip: {
        ...state.payersByTrip,
        [tripId]: payers,
      },
    })),

  addExpense: (tripId, expense) =>
    set((state) => ({
      expensesByTrip: {
        ...state.expensesByTrip,
        [tripId]: [
          ...(state.expensesByTrip[tripId] || []),
          expense,
        ],
      },
    })),

  updateExpense: (tripId, id, updatedExpense) =>
    set((state) => ({
      expensesByTrip: {
        ...state.expensesByTrip,
        [tripId]: state.expensesByTrip[tripId].map((exp) =>
          exp.id === id ? { ...exp, ...updatedExpense } : exp
        ),
      },
    })),

  deleteExpense: (tripId, id) =>
    set((state) => ({
      expensesByTrip: {
        ...state.expensesByTrip,
        [tripId]: state.expensesByTrip[tripId].filter(
          (exp) => exp.id !== id
        ),
      },
    })),
}));

export default useExpenseStore;