import { create } from "zustand";

const useUiStore = create((set) => ({
  isLoading: false,
  error: null,
  toasts: [],

  setIsLoading: (value) => set({ isLoading: value }),
  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),

  addToast: (message, type = "info") =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: crypto.randomUUID(),
          message,
          type,
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

export default useUiStore;