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
          
          // Configurar el proveedor para usar el flujo de popup
          provider.setCustomParameters({
            prompt: 'select_account',
          });

          const result = await signInWithPopup(auth, provider);
          const mappedUser = mapFirebaseUserToUser(result.user);
          
          // Actualizar el estado inmediatamente después del login exitoso
          // El listener de onAuthStateChanged también se ejecutará, pero esto asegura
          // que el estado se actualice de inmediato
          set({ 
            firebaseUser: result.user, 
            user: mappedUser, 
            isLoading: false,
            error: undefined 
          });

          // Opcional: Enviar token al backend para crear/actualizar usuario
          // Esta llamada es opcional y no bloquea el login si falla
          try {
            const token = await getIdToken(result.user);
            const response = await fetch(`${API_BASE_URL}/auth/firebase`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken: token }),
            });
            
            // Solo loguear si hay error, pero no fallar el login
            if (!response.ok) {
              console.warn('Backend no disponible o endpoint no implementado:', response.status);
            }
          } catch (backendError) {
            // No fallar el login si el backend falla o el endpoint no existe
            // Esto es normal si el backend aún no tiene el endpoint implementado
            console.warn('No se pudo sincronizar con backend (esto es opcional):', backendError);
          }
        } catch (error: any) {
          console.error('Error en login:', error);
          
          let errorMessage = 'Error al iniciar sesión con Google';
          
          // Manejar errores específicos de Firebase
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'El popup fue cerrado. Por favor, intenta de nuevo.';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
          } else if (error.code === 'auth/configuration-not-found') {
            errorMessage = 'Google Sign-In no está configurado. Por favor, habilítalo en Firebase Console.';
          } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'Este dominio no está autorizado. Contacta al administrador.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
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
