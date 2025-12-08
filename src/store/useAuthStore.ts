import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://planificauapi.onrender.com';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error?: string;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: () => boolean;
  initializeAuth: () => () => void; // Retorna función de cleanup
}

// Mapear Firebase User a nuestro tipo User
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
    picture: firebaseUser.photoURL || undefined,
    createdAt: firebaseUser.metadata.creationTime,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: true, // Iniciar como true para esperar la verificación inicial
      error: undefined,

      isAuthenticated: () => Boolean(get().user && get().firebaseUser),

      initializeAuth: () => {
        // Escuchar cambios en el estado de autenticación de Firebase
        const unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            if (firebaseUser) {
              // Usuario autenticado
              const user = mapFirebaseUserToUser(firebaseUser);
              set({ firebaseUser, user, isLoading: false, error: undefined });
            } else {
              // Usuario no autenticado
              set({ firebaseUser: null, user: null, isLoading: false, error: undefined });
            }
          },
          (error) => {
            console.error('Error en auth state:', error);
            set({ error: error.message, isLoading: false });
          }
        );

        // Retornar función de cleanup
        return unsubscribe;
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');

          const result = await signInWithPopup(auth, provider);
          const user = mapFirebaseUserToUser(result.user);
          
          set({ firebaseUser: result.user, user, isLoading: false });

          // Opcional: Enviar token al backend para crear/actualizar usuario
          try {
            const token = await getIdToken(result.user);
            await fetch(`${API_BASE_URL}/auth/firebase`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken: token }),
            });
          } catch (backendError) {
            // No fallar el login si el backend falla, solo loguear
            console.warn('Error al sincronizar con backend:', backendError);
          }
        } catch (error: any) {
          console.error('Error en login:', error);
          set({
            error: error.message ?? 'Error al iniciar sesión con Google',
            isLoading: false,
          });
          throw error;
        }
      },

      getAccessToken: async (): Promise<string | null> => {
        const { firebaseUser } = get();
        if (!firebaseUser) return null;

        try {
          // Obtener token actualizado (Firebase lo refresca automáticamente si es necesario)
          const token = await getIdToken(firebaseUser, true); // true = forceRefresh
          return token;
        } catch (error) {
          console.error('Error al obtener token:', error);
          return null;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, firebaseUser: null, isLoading: false, error: undefined });
        } catch (error: any) {
          console.error('Error en logout:', error);
          // Aún así limpiar el estado local
          set({ user: null, firebaseUser: null, isLoading: false, error: undefined });
        }
      },
    }),
    {
      name: 'planificau-auth',
      partialize: (state) => ({
        // No persistir firebaseUser, solo el user básico para referencia
        user: state.user,
      }),
    }
  )
);
