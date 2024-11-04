import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState,  UserInfo    } from '../types/user';
import { ClientSideApiService } from '../services/ClientSideApiService';
import { useFlashMessageStore } from './flashMessageStore';

const initialState: Omit<AuthState, 'resetStore' | 'login' | 'logout'> = {
  user: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      resetStore: () => set(initialState),
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ClientSideApiService.login(email, password);
          set({ user: response.user, isLoading: false });
          useFlashMessageStore.getState().setFlashMessage('Login successful!');
          return response;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return null;
        }
      },
      logout: async () => {
        try {
          await ClientSideApiService.logout();
          get().resetStore();
          clearAuthData();
          useFlashMessageStore.getState().setFlashMessage('Logged out successfully');
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      setUser: (user: UserInfo | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

function clearAuthData() {
  localStorage.removeItem('auth-storage');
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  useAuthStore.persist.clearStorage();
}
