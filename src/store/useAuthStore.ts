import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error?: string;
  loginWithGoogle: () => void;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

interface MeResponse {
  user: User;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: undefined,

      isAuthenticated: () => Boolean(get().user),

      loginWithGoogle: () => {
        // Redirigir directamente al endpoint de Google OAuth del backend
        // El backend manejará el flujo completo y redirigirá a /auth/success
        window.location.href = `${API_BASE_URL}/auth/google`;
      },

      checkAuth: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include', // Importante: incluir cookies
          });

          if (!res.ok) {
            if (res.status === 401) {
              set({ user: null, isLoading: false });
              return;
            }
            throw new Error('No se pudo verificar la autenticación');
          }

          const data: MeResponse = await res.json();
          set({ user: data.user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message ?? 'Error al verificar autenticación', isLoading: false, user: null });
        }
      },

      refreshAccessToken: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Las cookies se envían automáticamente
          });

          if (!res.ok) {
            await get().logout();
            throw new Error('No se pudo refrescar la sesión');
          }

          // El accessToken viene en cookies HTTP-only, no necesitamos guardarlo
          // Solo verificamos que la respuesta fue exitosa
          await res.json();
        } catch (error: any) {
          await get().logout();
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include', // Las cookies se envían automáticamente
          });
        } catch {
          // No hacemos throw para evitar bloquear el logout local si la red falla
        } finally {
          set({ user: null, isLoading: false, error: undefined });
        }
      },
    }),
    {
      name: 'planificau-auth',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
