import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      
      setAuth: (user, accessToken, refreshToken) => 
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      
      clearAuth: () => 
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      
      setAccessToken: (token) => 
        set({ accessToken: token }),
      
      login: async (email: string, password: string) => {
        try {
          const response = await api.post<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/api/auth/login', { email, password });

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken || null,
            isAuthenticated: true,
          });
        } catch (error) {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          throw error;
        }
      },
      
      logout: async () => {
        const { accessToken } = get();
        
        try {
          if (accessToken) {
            await api.post('/api/auth/logout', {});
          }
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        } finally {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        }
      },
      
      refresh: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await api.post<{
            accessToken: string;
            refreshToken: string;
          }>('/api/auth/refresh', { refreshToken });

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          throw error;
        }
      },
    }),
    {
      name: 'shelfzone-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
