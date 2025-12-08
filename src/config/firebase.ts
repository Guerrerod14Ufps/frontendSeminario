/**
 * Configuración de Firebase
 */

import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAv42Bc1cMtAw4zhvb5PokJy4sjM2ntlLw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'planificau-d20d4.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'planificau-d20d4',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'planificau-d20d4.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '422919538088',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:422919538088:web:120012fc6e3ba7f65c899d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-4NT064KG2X',
};

// Inicializar Firebase solo si no está ya inicializado
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar Auth
export const auth = getAuth(app);

// Inicializar Analytics solo en el cliente (no en SSR)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics no disponible:', error);
  }
}

export { analytics };
export default app;

