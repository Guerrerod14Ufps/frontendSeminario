/**
 * Store principal de Zustand para el estado global de PlanificaU
 * Gestiona tareas, sesiones Pomodoro, estadísticas y configuraciones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Task,
  TaskStatus,
  PomodoroSession,
  PomodoroSettings,
  DailyStats,
  UserStats,
  Notification,
} from '../types';
import { taskApi } from '../services/taskApi';
import { statsApi } from '../services/statsApi';
import { useAuthStore } from './useAuthStore';

interface AppState {
  // Tareas
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;

  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  currentPomodoro: {
    isRunning: boolean;
    timeLeft: number; // segundos
    type: 'focus' | 'short-break' | 'long-break';
    sessionCount: number;
  } | null;
  pomodoroSettings: PomodoroSettings;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => Promise<void>;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  setCurrentPomodoro: (pomodoro: AppState['currentPomodoro']) => void;

  // Estadísticas
  dailyStats: DailyStats[];
  userStats: UserStats;
  loadStats: () => Promise<void>;
  loadDailyStats: () => Promise<void>;
  updateDailyStats: (date: string, updates: Partial<DailyStats>) => Promise<void>;
  updateUserStats: (updates: Partial<UserStats>) => Promise<void>;

  // Notificaciones
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const defaultPomodoroSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

const defaultUserStats: UserStats = {
  totalTasksCompleted: 0,
  totalPomodoroSessions: 0,
  totalStudyTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  badges: [],
  level: 1,
  experience: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      tasks: [],
      pomodoroSessions: [],
      currentPomodoro: null,
      pomodoroSettings: defaultPomodoroSettings,
      dailyStats: [],
      userStats: defaultUserStats,
      notifications: [],

      // Sincronización con backend
      loadTasks: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        if (!isAuthenticated) return;

        try {
          const tasksFromApi = await taskApi.list();
          set({ tasks: tasksFromApi });
        } catch (error) {
          console.error('Error al cargar tareas:', error);
        }
      },

      // Cargar estadísticas del usuario desde el backend
      // Hace merge inteligente: mantiene los valores más altos entre local y backend
      loadStats: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        if (!isAuthenticated) return;

        try {
          const { stats } = await statsApi.getUserStats();
          // Hacer merge: mantener el máximo de cada valor para no perder progreso local
          // Mapear solo los campos relevantes de UserStats (ignorar id, userId, etc.)
          set((state) => {
            const backendStats: UserStats = {
              totalTasksCompleted: stats.totalTasksCompleted,
              totalPomodoroSessions: stats.totalPomodoroSessions,
              totalStudyTime: stats.totalStudyTime,
              currentStreak: stats.currentStreak,
              longestStreak: stats.longestStreak,
              badges: stats.badges || [],
              level: stats.level,
              experience: stats.experience,
            };
            
            const mergedStats: UserStats = {
              ...backendStats,
              experience: Math.max(backendStats.experience, state.userStats.experience),
              level: Math.max(backendStats.level, state.userStats.level),
              totalTasksCompleted: Math.max(backendStats.totalTasksCompleted, state.userStats.totalTasksCompleted),
              currentStreak: Math.max(backendStats.currentStreak, state.userStats.currentStreak),
              longestStreak: Math.max(backendStats.longestStreak, state.userStats.longestStreak),
              totalPomodoroSessions: Math.max(backendStats.totalPomodoroSessions, state.userStats.totalPomodoroSessions),
              totalStudyTime: Math.max(backendStats.totalStudyTime, state.userStats.totalStudyTime),
              // Mantener badges del backend si tiene más, o combinar ambos
              badges: [...new Set([...backendStats.badges, ...state.userStats.badges])],
            };
            return { userStats: mergedStats };
          });
        } catch (error) {
          console.error('Error al cargar estadísticas:', error);
          // Si falla, mantener las estadísticas locales (ya están en localStorage)
        }
      },

      // Cargar estadísticas diarias desde el backend
      // Hace merge inteligente: combina estadísticas diarias de local y backend
      loadDailyStats: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        if (!isAuthenticated) return;

        try {
          const { dailyStats: backendStats } = await statsApi.getDailyStats();
          // Hacer merge: combinar estadísticas diarias, manteniendo los máximos
          set((state) => {
            const localStatsMap = new Map(state.dailyStats.map(s => [s.date, s]));
            const mergedStats = backendStats.map(backendStat => {
              const localStat = localStatsMap.get(backendStat.date);
              if (!localStat) return backendStat;
              
              // Mantener el máximo de cada valor
              return {
                ...backendStat,
                tasksCompleted: Math.max(backendStat.tasksCompleted, localStat.tasksCompleted),
                pomodoroSessions: Math.max(backendStat.pomodoroSessions, localStat.pomodoroSessions),
                totalStudyTime: Math.max(backendStat.totalStudyTime, localStat.totalStudyTime),
              };
            });
            
            // Agregar estadísticas locales que no están en el backend
            localStatsMap.forEach((localStat, date) => {
              if (!mergedStats.find(s => s.date === date)) {
                mergedStats.push(localStat);
              }
            });
            
            return { dailyStats: mergedStats };
          });
        } catch (error) {
          console.error('Error al cargar estadísticas diarias:', error);
          // Si falla, mantener las estadísticas locales (ya están en localStorage)
        }
      },

      // Acciones de tareas
      addTask: async (taskData) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        let newTask: Task;

        if (isAuthenticated) {
          newTask = await taskApi.create({
            ...taskData,
          });
        } else {
          newTask = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        // Actualizar estadísticas
        const today = new Date().toISOString().split('T')[0];
        get().updateDailyStats(today, {
          tasksCreated: (get().dailyStats.find((s) => s.date === today)?.tasksCreated || 0) + 1,
        });
      },

      updateTask: async (id, updates) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        let updatedTask: Task | null = null;

        if (isAuthenticated) {
          const currentTask = get().tasks.find((t) => t.id === id);
          updatedTask = await taskApi.update(id, updates, currentTask);
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? updatedTask ?? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: async (id) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        if (isAuthenticated) {
          await taskApi.remove(id);
        }
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskStatus: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus: TaskStatus =
          task.status === 'completed' ? 'pending' : 'completed';

        // Verificar si la tarea ya había sido completada antes
        const wasAlreadyCompleted = Boolean(task.completedAt);
        const isNewlyCompleted = newStatus === 'completed' && !wasAlreadyCompleted;

        await get().updateTask(id, {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        });

        // Actualizar estadísticas solo si es la primera vez que se completa
        if (isNewlyCompleted) {
          const today = new Date().toISOString().split('T')[0];
          const isAuthenticated = useAuthStore.getState().isAuthenticated();
          
          // Actualizar estadísticas diarias
          await get().updateDailyStats(today, {
            tasksCompleted:
              (get().dailyStats.find((s) => s.date === today)?.tasksCompleted || 0) + 1,
          });
          
          // Actualizar estadísticas del usuario
          // Si está autenticado, usar el endpoint de increment para mejor rendimiento
          if (isAuthenticated) {
            try {
              await statsApi.increment('tasksCompleted', 1);
              await statsApi.increment('experience', 10);
              // Recargar estadísticas actualizadas del backend
              await get().loadStats();
            } catch (error) {
              console.error('Error incrementando estadísticas:', error);
              // Fallback: actualizar localmente
              await get().updateUserStats({
                totalTasksCompleted: get().userStats.totalTasksCompleted + 1,
                experience: get().userStats.experience + 10,
              });
            }
          } else {
            // Si no está autenticado, solo actualizar localmente
            await get().updateUserStats({
              totalTasksCompleted: get().userStats.totalTasksCompleted + 1,
              experience: get().userStats.experience + 10,
            });
          }
        }
      },

      // Acciones de Pomodoro
      addPomodoroSession: async (sessionData) => {
        const newSession: PomodoroSession = {
          ...sessionData,
          id: crypto.randomUUID(),
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          pomodoroSessions: [...state.pomodoroSessions, newSession],
        }));

        // Actualizar estadísticas
        const today = new Date().toISOString().split('T')[0];
        const duration = sessionData.duration;
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        
        // Actualizar estadísticas diarias
        await get().updateDailyStats(today, {
          pomodoroSessions:
            (get().dailyStats.find((s) => s.date === today)?.pomodoroSessions || 0) + 1,
          totalStudyTime:
            (get().dailyStats.find((s) => s.date === today)?.totalStudyTime || 0) + duration,
        });
        
        // Actualizar estadísticas del usuario
        // Si está autenticado, usar el endpoint de increment para mejor rendimiento
        if (isAuthenticated) {
          try {
            await statsApi.increment('pomodoroSessions', 1);
            await statsApi.increment('studyTime', duration);
            await statsApi.increment('experience', 5);
            // Recargar estadísticas actualizadas del backend
            await get().loadStats();
          } catch (error) {
            console.error('Error incrementando estadísticas:', error);
            // Fallback: actualizar localmente
            await get().updateUserStats({
              totalPomodoroSessions: get().userStats.totalPomodoroSessions + 1,
              totalStudyTime: get().userStats.totalStudyTime + duration,
              experience: get().userStats.experience + 5,
            });
          }
        } else {
          // Si no está autenticado, solo actualizar localmente
          await get().updateUserStats({
            totalPomodoroSessions: get().userStats.totalPomodoroSessions + 1,
            totalStudyTime: get().userStats.totalStudyTime + duration,
            experience: get().userStats.experience + 5,
          });
        }
      },

      updatePomodoroSettings: (settings) => {
        set((state) => ({
          pomodoroSettings: { ...state.pomodoroSettings, ...settings },
        }));
      },

      setCurrentPomodoro: (pomodoro) => {
        set({ currentPomodoro: pomodoro });
      },

      // Acciones de estadísticas
      updateDailyStats: async (date, updates) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        
        // Actualizar localmente primero
        set((state) => {
          const existing = state.dailyStats.find((s) => s.date === date);
          if (existing) {
            return {
              dailyStats: state.dailyStats.map((s) =>
                s.date === date ? { ...s, ...updates } : s
              ),
            };
          } else {
            return {
              dailyStats: [
                ...state.dailyStats,
                {
                  date,
                  tasksCompleted: 0,
                  pomodoroSessions: 0,
                  totalStudyTime: 0,
                  tasksCreated: 0,
                  ...updates,
                },
              ],
            };
          }
        });

        // Sincronizar con backend si está autenticado
        if (isAuthenticated) {
          try {
            const { dailyStat } = await statsApi.updateDailyStats(date, updates);
            // Actualizar con la respuesta del backend para asegurar consistencia
            set((state) => ({
              dailyStats: state.dailyStats.map((s) =>
                s.date === date ? dailyStat : s
              ),
            }));
          } catch (error) {
            console.error('Error sincronizando estadísticas diarias:', error);
            // Si falla, mantener los cambios locales
          }
        }
      },

      updateUserStats: async (updates) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        
        // Actualizar localmente primero
        set((state) => {
          const newStats = { ...state.userStats, ...updates };
          // Calcular nivel basado en experiencia (100 XP por nivel)
          const newLevel = Math.floor(newStats.experience / 100) + 1;
          if (newLevel > state.userStats.level) {
            get().addNotification({
              type: 'achievement',
              title: '¡Subiste de nivel!',
              message: `Ahora eres nivel ${newLevel}. ¡Sigue así!`,
            });
          }
          return { userStats: newStats };
        });

        // Sincronizar con backend si está autenticado
        if (isAuthenticated) {
          try {
            const { stats } = await statsApi.updateUserStats(updates);
            // Mapear solo los campos relevantes de UserStats (ignorar id, userId, etc.)
            const backendStats: UserStats = {
              totalTasksCompleted: stats.totalTasksCompleted,
              totalPomodoroSessions: stats.totalPomodoroSessions,
              totalStudyTime: stats.totalStudyTime,
              currentStreak: stats.currentStreak,
              longestStreak: stats.longestStreak,
              badges: stats.badges || [],
              level: stats.level,
              experience: stats.experience,
            };
            // Actualizar con la respuesta del backend para asegurar consistencia
            set({ userStats: backendStats });
          } catch (error) {
            console.error('Error sincronizando estadísticas:', error);
            // Si falla, mantener los cambios locales
          }
        }
      },

      // Acciones de notificaciones
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Limitar a 50
        }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'planificau-storage',
      // Serializar/deserializar fechas correctamente
      partialize: (state) => ({
        tasks: state.tasks,
        pomodoroSessions: state.pomodoroSessions,
        pomodoroSettings: state.pomodoroSettings,
        dailyStats: state.dailyStats,
        userStats: state.userStats,
        notifications: state.notifications,
      }),
    }
  )
);

