// store/loading.ts
import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loaderType: string | null;
  setLoading: (path: string) => void;
  completeLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loaderType: null,
  setLoading: (path) => {
    const loaderType = path.startsWith('/public') || path.startsWith('/auth')
      ? 'public'
      : path.startsWith('/admin')
      ? 'admin'
      : path.startsWith('/gestionnaire') || path.startsWith('/complete-profile')
      ? 'gestionnaire'
      : 'default';
    set({ isLoading: true, loaderType });
  },
  completeLoading: () => set({ isLoading: false, loaderType: null }),
}));