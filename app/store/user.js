import { create } from "zustand";

const useUser = create((set) => ({
  users: [],
  teamCode: "",
  setUsers: (users) => set({ users }),
  setTeamCode: (teamCode) => set({ teamCode }),
}));

export default useUser;
