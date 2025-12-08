import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://planificauapi.onrender.com';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { getAccessToken, logout } = useAuthStore.getState();

  const buildRequest = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Agregar token de Firebase si no se omite la autenticación
    if (!options.skipAuth) {
      const token = await getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return {
      ...options,
      headers: headers as HeadersInit,
      mode: 'cors' as RequestMode,
    };
  };

  let requestOptions = await buildRequest();
  let response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

  // Si recibimos 401, intentar refrescar el token
  if (response.status === 401 && !options.skipAuth) {
    try {
      // Firebase maneja el refresh automáticamente, solo obtenemos un nuevo token
      const newToken = await getAccessToken();
      if (newToken) {
        // Reintentar la petición original con el nuevo token
        requestOptions = await buildRequest();
        response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
      }

      // Si sigue siendo 401 después del refresh, hacer logout
      if (response.status === 401) {
        await logout();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
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

