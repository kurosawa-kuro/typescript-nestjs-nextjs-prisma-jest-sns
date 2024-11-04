import { create } from 'zustand';
import { UserDetails } from '@/types/user';

interface UserStore {
  users: UserDetails[];
  setUsers: (users: UserDetails[]) => void;
  updateUser: (updatedUser: UserDetails) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  updateUser: (updatedUser) => set((state) => ({
    users: state.users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ),
  })),
}));
