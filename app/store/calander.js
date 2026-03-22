import { create } from "zustand";

const useCalander = create((set) => ({
  selectedIds: [],
  selectedDate: new Date(),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
  updateSelectedIds: (id) => {
    set((state) => {
      const isIncluded = state.selectedIds.includes(id);
      return {
        selectedIds: isIncluded
          ? state.selectedIds.filter((el) => el !== id)
          : [...state.selectedIds, id],
      };
    });
  },
}));

export default useCalander;
