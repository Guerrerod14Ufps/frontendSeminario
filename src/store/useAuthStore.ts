import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/auth/callback`;
const CODE_VERIFIER_KEY = 'planificau_google_code_verifier';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error?: string;
  loginWithGoogle: () => Promise<void>;
  completeGoogleLogin: (code: string) => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: undefined,

      isAuthenticated: () => Boolean(get().tokens?.accessToken && get().user),

      loginWithGoogle: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const res = await fetch(
            `${API_BASE_URL}/auth/google/url?redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`
          );
          if (!res.ok) {
            throw new Error('No se pudo obtener la URL de autenticación.');
          }
          const data: { url: string; codeVerifier?: string } = await res.json();
          if (data.codeVerifier) {
            sessionStorage.setItem(CODE_VERIFIER_KEY, data.codeVerifier);
          }
          window.location.href = data.url;
        } catch (error: any) {
          set({ error: error.message ?? 'Error iniciando sesión con Google', isLoading: false });
          throw error;
        }
      },

      completeGoogleLogin: async (code: string) => {
        set({ isLoading: true, error: undefined });
        try {
          const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
          const res = await fetch(`${API_BASE_URL}/auth/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              codeVerifier,
              redirectUri: GOOGLE_REDIRECT_URI,
            }),
          });

          if (!res.ok) {
            throw new Error('No se pudo completar el inicio de sesión.');
          }

          const data: LoginResponse = await res.json();
          set({
            user: data.user,
            tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
            isLoading: false,
          });
          sessionStorage.removeItem(CODE_VERIFIER_KEY);
        } catch (error: any) {
          set({ error: error.message ?? 'Error al procesar el inicio de sesión', isLoading: false });
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) throw new Error('Sin refresh token disponible');

        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        if (!res.ok) {
          await get().logout();
          throw new Error('No se pudo refrescar la sesión');
        }

        const data: { accessToken: string } = await res.json();
        set({ tokens: { ...tokens, accessToken: data.accessToken } });
        return data.accessToken;
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refreshToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });
          }
        } catch {
          // No hacemos throw para evitar bloquear el logout local si la red falla
        } finally {
          set({ user: null, tokens: null, isLoading: false, error: undefined });
        }
      },
    }),
    {
      name: 'planificau-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);

