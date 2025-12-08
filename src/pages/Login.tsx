import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoading, error, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    // Observamos 'user' directamente porque es reactivo
    if (user && isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle>Inicia sesión para continuar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-600">
            Conecta con tu cuenta de Google para sincronizar tus tareas, sesiones Pomodoro y
            estadísticas en todos tus dispositivos.
          </p>
          <Button
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            className="w-full"
            size="lg"
            variant="primary"
          >
            {isLoading ? 'Redirigiendo...' : 'Continuar con Google'}
          </Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

