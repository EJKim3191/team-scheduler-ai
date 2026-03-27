import { create } from "zustand";

const useTeam = create((set) => ({
  teamCode: "",
  teamName: "",
  setTeamCode: (teamCode) => set({ teamCode }),
  setTeamName: (teamName) => set({ teamName }),
}));

export default useTeam;
