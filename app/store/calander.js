import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useCalander = create(
  devtools((set) => ({
    selectedIds: [],
    selectedSchedule: [],
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
    setSelectedSchedule: (scheduleId) => {
      set((state) => {
        const isIncluded = state.selectedSchedule.includes(scheduleId);
        return {
          selectedSchedule: isIncluded
            ? state.selectedSchedule.filter((el) => el !== scheduleId)
            : [...state.selectedSchedule, scheduleId],
        };
      });
    },
    clearSelectedIds: () => {
      set({ selectedIds: [] });
    },
    clearSelectedSchedule: () => {
      set({ selectedSchedule: [] });
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
  })),
);

export default useCalander;
