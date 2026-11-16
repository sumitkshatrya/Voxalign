import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('voxalign_jwt') || null,
  isLoading: true,
  error: null,
  theme: (localStorage.getItem('voxalign_theme') as 'dark' | 'light') || 'dark',

  setTheme: (theme) => {
    localStorage.setItem('voxalign_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authApi.login(credentials);
      localStorage.setItem('voxalign_jwt', resp.data.token);
      set({ user: resp.data.user, token: resp.data.token, isLoading: false });
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authApi.register(data);
      localStorage.setItem('voxalign_jwt', resp.data.token);
      set({ user: resp.data.user, token: resp.data.token, isLoading: false });
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('voxalign_jwt');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const resp = await authApi.getMe();
      set({ user: resp.data.user, isLoading: false });
    } catch (err) {
      // Auto-fallback: if initial load, seed with demo user if no cookie
      set({ user: null, isLoading: false });
    }
  },

  updateUser: (user) => set({ user })
}));
