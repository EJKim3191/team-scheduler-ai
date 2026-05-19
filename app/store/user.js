import { create } from "zustand";

const useUser = create((set) => ({
  users: [],
  teamCode: "",
  userId: "",
  teams: [],
  setUsers: (users) => set({ users }),
  setTeamCode: (teamCode) => set({ teamCode }),
  setTeamId: (teamId) => set({ teamId }),
  setUserId: (userId) => set({ userId }),
  setTeams: (teams) => set({ teams }),
}));

export default useUser;
