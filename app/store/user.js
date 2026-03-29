import { create } from "zustand";

const useUser = create((set) => ({
  users: [],
  teamCode: "",
  userId: "",
  setUsers: (users) => set({ users }),
  setTeamCode: (teamCode) => set({ teamCode }),
  setUserId: (userId) => set({ userId }),
}));

export default useUser;
