import { create } from "zustand";

const MAX_VISIBLE_TOASTS = 3;

const isSameToast = (a, b) => {
  return a.message === b.message && a.type === b.type;
};

const useToastStore = create((set, get) => ({
  visibleToasts: [],
  queuedToasts: [],

  addToast: ({ message, type = "info", duration = 3000 }) => {
    const newToast = {
      id: crypto.randomUUID(),
      message,
      type,
      duration,
    };

    const { visibleToasts, queuedToasts } = get();

    const alreadyVisible = visibleToasts.some((toast) =>
      isSameToast(toast, newToast)
    );

    const alreadyQueued = queuedToasts.some((toast) =>
      isSameToast(toast, newToast)
    );

    if (alreadyVisible || alreadyQueued) {
      return;
    }

    if (visibleToasts.length < MAX_VISIBLE_TOASTS) {
      set({
        visibleToasts: [...visibleToasts, newToast],
      });

      setTimeout(() => {
        get().removeToast(newToast.id);
      }, duration);

      return;
    }

    set({
      queuedToasts: [...queuedToasts, newToast],
    });
  },

  removeToast: (id) => {
    const { visibleToasts, queuedToasts } = get();

    const updatedVisible = visibleToasts.filter((toast) => toast.id !== id);

    if (queuedToasts.length === 0) {
      set({ visibleToasts: updatedVisible });
      return;
    }

    const nextToast = queuedToasts[0];
    const updatedQueue = queuedToasts.slice(1);

    set({
      visibleToasts: [...updatedVisible, nextToast],
      queuedToasts: updatedQueue,
    });

    setTimeout(() => {
      get().removeToast(nextToast.id);
    }, nextToast.duration);
  },

  clearAllToasts: () => {
    set({
      visibleToasts: [],
      queuedToasts: [],
    });
  },
}));

export default useToastStore;