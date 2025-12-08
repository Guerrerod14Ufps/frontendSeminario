import { apiFetch } from '../lib/api';
import type { UserStats, DailyStats } from '../types';

// Tipo para la respuesta del backend (incluye campos adicionales)
interface BackendUserStats extends UserStats {
  id?: string;
  userId?: string;
  lastActivityDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UserStatsResponse {
  stats: BackendUserStats;
}

interface DailyStatsResponse {
  dailyStats: DailyStats[];
}

interface DailyStatResponse {
  dailyStat: DailyStats;
}

export const statsApi = {
  // Obtener estadísticas del usuario
  getUserStats: () => apiFetch<UserStatsResponse>('/stats/user'),
  
  // Actualizar estadísticas del usuario
  updateUserStats: (updates: Partial<UserStats>) =>
    apiFetch<UserStatsResponse>('/stats/user', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  // Obtener estadísticas diarias
  getDailyStats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiFetch<DailyStatsResponse>(`/stats/daily${query ? `?${query}` : ''}`);
  },
  
  // Actualizar estadísticas diarias
  updateDailyStats: (date: string, updates: Partial<DailyStats>) =>
    apiFetch<DailyStatResponse>('/stats/daily', {
      method: 'PUT',
      body: JSON.stringify({ date, ...updates }),
    }),
  
  // Incrementar estadísticas (método conveniente)
  increment: (type: 'tasksCompleted' | 'pomodoroSessions' | 'studyTime' | 'experience', value: number) =>
    apiFetch<UserStatsResponse>('/stats/increment', {
      method: 'POST',
      body: JSON.stringify({ type, value }),
    }),
};

