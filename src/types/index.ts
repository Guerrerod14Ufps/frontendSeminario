/**
 * Tipos principales para la aplicación PlanificaU
 */

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  estimatedTime?: number; // en minutos
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PomodoroSession {
  id: string;
  duration: number; // en minutos (típicamente 25)
  type: 'focus' | 'short-break' | 'long-break';
  completedAt: Date | string;
  taskId?: string; // asociado a una tarea
}

export interface PomodoroSettings {
  focusDuration: number; // minutos
  shortBreakDuration: number; // minutos
  longBreakDuration: number; // minutos
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  pomodoroSessions: number;
  totalStudyTime: number; // minutos
  tasksCreated: number;
}

export interface UserStats {
  totalTasksCompleted: number;
  totalPomodoroSessions: number;
  totalStudyTime: number; // minutos
  currentStreak: number; // días consecutivos
  longestStreak: number;
  badges: string[];
  level: number;
  experience: number;
}

export interface Notification {
  id: string;
  type: 'task-reminder' | 'pomodoro-complete' | 'break-complete' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
}


