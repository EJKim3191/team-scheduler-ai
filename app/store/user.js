import { create } from "zustand";

const useUser = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));

export default useUser;
