import { create } from 'zustand';

interface FlashMessageState {
  message: string | null;
  setFlashMessage: (message: string | null) => void;
  clearFlashMessage: () => void;
}

export const useFlashMessageStore = create<FlashMessageState>((set) => ({
  message: null,
  setFlashMessage: (message) => set({ message }),
  clearFlashMessage: () => set({ message: null }),
}));
