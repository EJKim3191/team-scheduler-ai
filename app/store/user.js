import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useUser = create(
  devtools((set) => ({
    users: [],
    teamCode: "",
    userId: "",
    teams: [],
    setUsers: (users) => set({ users }),
    setTeamCode: (teamCode) => set({ teamCode }),
    setTeamId: (teamId) => set({ teamId }),
    setUserId: (userId) => set({ userId }),
    setTeams: (teams) => set({ teams }),
  })),
);

export default useUser;
