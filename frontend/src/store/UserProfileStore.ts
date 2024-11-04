import { create } from 'zustand';
import { UserDetails } from '@/types/user';

interface UserProfileStore {
  user: UserDetails | null;
  setUser: (user: UserDetails) => void;
  updateUser: (updatedFields: Partial<UserDetails>) => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (updatedFields) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedFields } : null
  })),
}));
