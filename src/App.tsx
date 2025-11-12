/**
 * Componente principal de PlanificaU
 * Configura las rutas y el layout de la aplicación
 */

import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard, Planificador, Pomodoro, Metricas } from './pages';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planificador" element={<Planificador />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/metricas" element={<Metricas />} />
      </Routes>
    </Layout>
  );
}

export default App;
