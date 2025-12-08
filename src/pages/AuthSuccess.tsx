import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const AuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuth, isLoading, error } = useAuthStore();

  useEffect(() => {
    checkAuth()
      .then(() => {
        // Esperar un momento para asegurar que el estado se actualizó
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      })
      .catch(() => {
        // Si hay error, redirigir al login después de un momento
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      });
  }, [checkAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle>Inicio de sesión exitoso</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-600">Verificando tu sesión...</p>
          ) : error ? (
            <p className="text-danger">Error al verificar la sesión. Redirigiendo al login...</p>
          ) : (
            <p className="text-neutral-600">Redirigiendo al dashboard...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

