import { create } from 'zustand';
import { UserResponse, LoginRequest, RegisterRequest } from '../types/user';
import { authService } from '../services/authService';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: !!authService.getCurrentUser(),
  loading: false,
  initializing: true,
  error: null,

  initAuth: async () => {
    set({ initializing: true });
    try {
      const user = await authService.validateSession();
      set({
        user,
        isAuthenticated: !!user,
        initializing: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        initializing: false,
      });
    }
  },

  login: async (credentials: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.login(credentials);
      set({ user: result.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  register: async (userData: RegisterRequest) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.register(userData);
      set({ user: result.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
