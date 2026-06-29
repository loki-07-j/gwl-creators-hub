import { create } from 'zustand';
import { api, setAccessToken, unwrap } from '@/lib/api';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string, role: 'member' | 'admin') => Promise<AuthUser>;
  register: (token: string, name: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setUser: (u: AuthUser) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  setUser: (u) => set({ user: u, status: 'authenticated' }),

  login: async (email, password, role) => {
    const { data } = await api.post('/auth/login', { email, password, role });
    setAccessToken(data.data.accessToken);
    set({ user: data.data.user, status: 'authenticated' });
    return data.data.user;
  },

  register: async (token, name, password) => {
    const { data } = await api.post('/auth/register', { token, name, password });
    setAccessToken(data.data.accessToken);
    set({ user: data.data.user, status: 'authenticated' });
    return data.data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    set({ user: null, status: 'unauthenticated' });
  },

  // Restores a session from the refresh-token cookie on app load.
  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.data.accessToken);
      const me = await unwrap<AuthUser>(api.get('/auth/me'));
      set({ user: me, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
