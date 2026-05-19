import { create } from "zustand";

const useTeam = create((set) => ({
  teamCode: "",
  teamName: "",
  team: [],
  setTeamCode: (teamCode) => set({ teamCode }),
  setTeamId: (teamId) => set({ teamId }),
  setTeamName: (teamName) => set({ teamName }),
}));

export default useTeam;
