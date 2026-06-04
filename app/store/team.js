import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useTeam = create(
  devtools((set) => ({
    teamCode: "",
    teamName: "",
    team: [],
    setTeamCode: (teamCode) => set({ teamCode }),
    setTeamId: (teamId) => set({ teamId }),
    setTeamName: (teamName) => set({ teamName }),
  })),
);

export default useTeam;
