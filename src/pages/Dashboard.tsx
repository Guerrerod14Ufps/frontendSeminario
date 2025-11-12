/**
 * Página Dashboard - Vista principal con resumen de progreso y estadísticas
 */

import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import {
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { tasks, userStats, dailyStats } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayStats = dailyStats.find((s) => s.date === today) || {
    date: today,
    tasksCompleted: 0,
    pomodoroSessions: 0,
    totalStudyTime: 0,
    tasksCreated: 0,
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === today
  ).length;

  const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  // Calcular nivel y experiencia
  const level = userStats.level;
  const experienceInLevel = userStats.experience % 100;
  const experienceToNextLevel = 100 - experienceInLevel;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Resumen de tu progreso académico
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {completedToday}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Hoy</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Sesiones Pomodoro</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {todayStats.pomodoroSessions}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Hoy</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Tiempo de Estudio</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {Math.round(todayStats.totalStudyTime)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Minutos hoy</p>
              </div>
              <div className="p-3 bg-accent-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Racha Actual</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {userStats.currentStreak}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Días consecutivos</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FireIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progreso de Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <TrophyIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Nivel {level}</p>
                    <p className="text-sm text-neutral-600">
                      {experienceInLevel} / 100 XP
                    </p>
                  </div>
                </div>
                <Badge variant="primary">+{experienceToNextLevel} XP para siguiente nivel</Badge>
              </div>
              <ProgressBar
                value={experienceInLevel}
                max={100}
                variant="primary"
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600">Tareas Pendientes</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {pendingTasks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Tareas Urgentes</p>
              <p className="text-2xl font-bold text-danger mt-1">
                {urgentTasks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Tasa de Completación</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {completionRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {completedToday > 0 || todayStats.pomodoroSessions > 0 ? (
            <div className="space-y-3">
              {completedToday > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-neutral-700">
                    Completaste {completedToday} tarea{completedToday > 1 ? 's' : ''} hoy
                  </p>
                </div>
              )}
              {todayStats.pomodoroSessions > 0 && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-primary-600" />
                  <p className="text-sm text-neutral-700">
                    Completaste {todayStats.pomodoroSessions} sesión{todayStats.pomodoroSessions > 1 ? 'es' : ''} Pomodoro hoy
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              Aún no hay actividad hoy. ¡Comienza a planificar tus tareas!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

