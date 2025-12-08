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
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  setCurrentPomodoro: (pomodoro: AppState['currentPomodoro']) => void;

  // Estadísticas
  dailyStats: DailyStats[];
  userStats: UserStats;
  updateDailyStats: (date: string, updates: Partial<DailyStats>) => void;
  updateUserStats: (updates: Partial<UserStats>) => void;

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

        const tasksFromApi = await taskApi.list();
        set({ tasks: tasksFromApi });
      },

      // Acciones de tareas
      addTask: async (taskData) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated();
        let newTask: Task;

        if (isAuthenticated) {
          newTask = await taskApi.create({
            ...taskData,
            createdAt: undefined,
            updatedAt: undefined,
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
          updatedTask = await taskApi.update(id, updates);
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

        await get().updateTask(id, {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        });

        // Actualizar estadísticas si se completó
        if (newStatus === 'completed') {
          const today = new Date().toISOString().split('T')[0];
          get().updateDailyStats(today, {
            tasksCompleted:
              (get().dailyStats.find((s) => s.date === today)?.tasksCompleted || 0) + 1,
          });
          get().updateUserStats({
            totalTasksCompleted: get().userStats.totalTasksCompleted + 1,
            experience: get().userStats.experience + 10,
          });
        }
      },

      // Acciones de Pomodoro
      addPomodoroSession: (sessionData) => {
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
        get().updateDailyStats(today, {
          pomodoroSessions:
            (get().dailyStats.find((s) => s.date === today)?.pomodoroSessions || 0) + 1,
          totalStudyTime:
            (get().dailyStats.find((s) => s.date === today)?.totalStudyTime || 0) + duration,
        });
        get().updateUserStats({
          totalPomodoroSessions: get().userStats.totalPomodoroSessions + 1,
          totalStudyTime: get().userStats.totalStudyTime + duration,
          experience: get().userStats.experience + 5,
        });
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
      updateDailyStats: (date, updates) => {
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
      },

      updateUserStats: (updates) => {
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

