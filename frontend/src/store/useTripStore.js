import { create } from "zustand";

const useTripStore = create((set) => ({
  selectedTrip: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip }),
  clearSelectedTrip: () => set({ selectedTrip: null }),
}));

export default useTripStore;