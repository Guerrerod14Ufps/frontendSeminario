import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { refreshAccessToken, logout } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const buildRequest = () => ({
    ...options,
    headers,
    credentials: 'include' as RequestCredentials, // Importante: incluir cookies HTTP-only
  });

  let response = await fetch(`${API_BASE_URL}${path}`, buildRequest());

  // Si recibimos 401, intentar refrescar el token usando cookies
  if (response.status === 401 && !options.skipAuth) {
    try {
      await refreshAccessToken();
      // Reintentar la petición original después del refresh
      response = await fetch(`${API_BASE_URL}${path}`, buildRequest());
    } catch (error) {
      await logout();
      throw error;
    }
  }

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(message || 'Error en la comunicación con el servidor');
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
};

const safeReadError = async (response: Response) => {
  try {
    const data = await response.json();
    return (data as { error?: string; message?: string })?.error || (data as { message?: string })?.message;
  } catch {
    return response.statusText;
  }
};

