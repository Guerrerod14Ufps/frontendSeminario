import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeGoogleLogin, error, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code) {
      return;
    }

    completeGoogleLogin(code)
      .then(() => navigate('/'))
      .catch(() => {});
  }, [completeGoogleLogin, location.search, navigate]);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle>Procesando inicio de sesión</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-600">Validando tus credenciales...</p>
          ) : error ? (
            <p className="text-danger">No se pudo completar el inicio de sesión. Intenta de nuevo.</p>
          ) : (
            <p className="text-neutral-600">Redirigiendo...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

