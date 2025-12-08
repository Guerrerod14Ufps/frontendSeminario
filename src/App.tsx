/**
 * Componente principal de PlanificaU
 * Configura las rutas y el layout de la aplicación
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard, Planificador, Pomodoro, Metricas, Login } from './pages';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';

const ProtectedRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadTasks = useAppStore((state) => state.loadTasks);

  useEffect(() => {
    // Cargar tareas cuando el usuario esté autenticado
    if (isAuthenticated()) {
      loadTasks().catch(() => {});
    }
  }, [isAuthenticated, loadTasks]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Inicializar el listener de Firebase Auth
    const unsubscribe = initializeAuth();
    
    // Cleanup al desmontar
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planificador" element={<Planificador />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/metricas" element={<Metricas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
