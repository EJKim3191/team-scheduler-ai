import { create } from "zustand";

const useCalander = create((set) => ({
  selectedIds: [],
  selectedDate: new Date(),
  timeBackgroundColor: {},
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

  addTimeBackgroundColor: (cellKey) => {
    set((state) => {
      const isIncluded = Object.keys(state.timeBackgroundColor).includes(
        cellKey,
      );
      return {
        timeBackgroundColor: isIncluded
          ? {
              ...state.timeBackgroundColor,
              [cellKey]: state.timeBackgroundColor[cellKey] + 1,
            }
          : { ...state.timeBackgroundColor, [cellKey]: 1 },
      };
    });
  },
}));

export default useCalander;
