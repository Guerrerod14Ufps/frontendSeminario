/**
 * Página Métricas - Gráficos y estadísticas de progreso
 */

import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const Metricas = () => {
  const { tasks, dailyStats, userStats } = useAppStore();

  // Preparar datos para gráfico de tareas completadas (últimos 7 días)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const tasksData = last7Days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStats = dailyStats.find((s) => s.date === dateStr);
    return {
      fecha: format(date, 'dd/MM', { locale: es }),
      completadas: dayStats?.tasksCompleted || 0,
      creadas: dayStats?.tasksCreated || 0,
    };
  });

  // Preparar datos para gráfico de Pomodoro (últimos 7 días)
  const pomodoroData = last7Days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStats = dailyStats.find((s) => s.date === dateStr);
    return {
      fecha: format(date, 'dd/MM', { locale: es }),
      sesiones: dayStats?.pomodoroSessions || 0,
      tiempo: Math.round((dayStats?.totalStudyTime || 0) / 60), // convertir a horas
    };
  });

  // Estadísticas por prioridad
  const priorityStats = tasks.reduce(
    (acc, task) => {
      if (task.status === 'completed') {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const priorityData = [
    { name: 'Urgente', completadas: priorityStats.urgent || 0 },
    { name: 'Alta', completadas: priorityStats.high || 0 },
    { name: 'Media', completadas: priorityStats.medium || 0 },
    { name: 'Baja', completadas: priorityStats.low || 0 },
  ];

  // Calcular promedios semanales
  const weeklyAvg = {
    tasksCompleted: Math.round(
      dailyStats
        .filter((s) => {
          const date = new Date(s.date);
          return date >= subDays(new Date(), 7);
        })
        .reduce((sum, s) => sum + s.tasksCompleted, 0) / 7
    ),
    pomodoroSessions: Math.round(
      dailyStats
        .filter((s) => {
          const date = new Date(s.date);
          return date >= subDays(new Date(), 7);
        })
        .reduce((sum, s) => sum + s.pomodoroSessions, 0) / 7
    ),
    studyTime: Math.round(
      dailyStats
        .filter((s) => {
          const date = new Date(s.date);
          return date >= subDays(new Date(), 7);
        })
        .reduce((sum, s) => sum + s.totalStudyTime, 0) / 7
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Métricas</h1>
        <p className="mt-2 text-neutral-600">
          Visualiza tu progreso y estadísticas de productividad
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Total Tareas Completadas</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {userStats.totalTasksCompleted}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Promedio semanal: {weeklyAvg.tasksCompleted}/día
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Total Sesiones Pomodoro</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {userStats.totalPomodoroSessions}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Promedio semanal: {weeklyAvg.pomodoroSessions}/día
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Tiempo Total de Estudio</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {Math.round(userStats.totalStudyTime / 60)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Racha Actual</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {userStats.currentStreak}
            </p>
            <p className="text-xs text-neutral-500 mt-1">días consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Completadas */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Completadas (Últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completadas"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  name="Completadas"
                />
                <Line
                  type="monotone"
                  dataKey="creadas"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Creadas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sesiones Pomodoro */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Pomodoro (Últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pomodoroData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sesiones" fill="#4f46e5" name="Sesiones" />
                <Bar dataKey="tiempo" fill="#f59e0b" name="Horas de estudio" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tareas por Prioridad */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas Completadas por Prioridad</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completadas" fill="#22c55e" name="Tareas Completadas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tareas Pendientes</span>
              <span className="font-semibold text-neutral-900">
                {tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tareas Completadas</span>
              <span className="font-semibold text-neutral-900">
                {tasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tasa de Completación</span>
              <span className="font-semibold text-neutral-900">
                {tasks.length > 0
                  ? Math.round(
                      (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Nivel Actual</span>
              <span className="font-semibold text-primary-600">Nivel {userStats.level}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logros</CardTitle>
          </CardHeader>
          <CardContent>
            {userStats.badges.length > 0 ? (
              <div className="space-y-2">
                {userStats.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-accent-50 rounded-lg">
                    <span className="text-2xl">🏆</span>
                    <span className="text-sm text-neutral-700">{badge}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                Completa más tareas para desbloquear logros
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

