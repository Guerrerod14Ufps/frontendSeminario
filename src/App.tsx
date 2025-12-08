/**
 * Componente principal de PlanificaU
 * Configura las rutas y el layout de la aplicación
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard, Planificador, Pomodoro, Metricas, Login, AuthSuccess } from './pages';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';

const ProtectedRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loadTasks = useAppStore((state) => state.loadTasks);

  useEffect(() => {
    // Verificar autenticación al montar el componente
    checkAuth().then(() => {
      if (isAuthenticated) {
        loadTasks().catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks().catch(() => {});
    }
  }, [isAuthenticated, loadTasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

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
