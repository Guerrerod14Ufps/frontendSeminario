import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { tokens, refreshAccessToken, logout } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const buildRequest = (accessToken?: string) => ({
    ...options,
    headers: {
      ...headers,
      ...(options.skipAuth
        ? {}
        : accessToken || tokens?.accessToken
        ? { Authorization: `Bearer ${accessToken ?? tokens?.accessToken}` }
        : {}),
    },
  });

  let response = await fetch(`${API_BASE_URL}${path}`, buildRequest());

  if (response.status === 401 && tokens?.refreshToken && !options.skipAuth) {
    try {
      const newAccessToken = await refreshAccessToken();
      response = await fetch(`${API_BASE_URL}${path}`, buildRequest(newAccessToken));
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
    return (data as { message?: string })?.message;
  } catch {
    return response.statusText;
  }
};

