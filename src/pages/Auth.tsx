import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import logoCcd from '@/assets/logo-ccd.jpg';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use ref for password to avoid it being visible in React DevTools
  const passwordRef = useRef<HTMLInputElement>(null);
  
  const { signIn, advisor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (advisor) {
      navigate('/');
    }
  }, [advisor, navigate]);

  // Clear error when user types
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    const password = passwordRef.current?.value || '';
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Ingrese usuario y contraseña');
      return;
    }

    setLoading(true);

    const { error } = await signIn(username.trim().toLowerCase(), password);
    
    // Clear password immediately after use for security
    if (passwordRef.current) {
      passwordRef.current.value = '';
    }
    
    if (error) {
      // Show specific error messages
      if (error.includes('Usuario no encontrado')) {
        setErrorMessage('Usuario no encontrado. Verifique su nombre de usuario.');
      } else if (error.includes('Contraseña incorrecta')) {
        setErrorMessage('Contraseña incorrecta. Intente nuevamente.');
      } else if (error.includes('no tiene contraseña')) {
        setErrorMessage('Este usuario no tiene contraseña configurada. Contacte al administrador.');
      } else {
        setErrorMessage(error);
      }
      toast({
        title: 'Error de inicio de sesión',
        description: 'Credenciales inválidas',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '¡Bienvenido!',
        description: 'Inicio de sesión exitoso',
      });
      navigate('/');
    }

    setLoading(false);
  };

  const clearPasswordOnFocus = () => {
    // Clear any error when focusing on password
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
            <img
              src={logoCcd}
              alt="CCD Logo"
              className="h-16 mx-auto mb-4 rounded-lg"
            />
            <h1 className="text-2xl font-bold text-primary-foreground">
              Sistema de Cotizaciones
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Ingrese sus credenciales de asesor
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
            <div>
              <label className="form-label form-label-required">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="pl-10"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div>
              <label className="form-label form-label-required">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  disabled={loading}
                  autoComplete="new-password"
                  onFocus={clearPasswordOnFocus}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Iniciar Sesión
            </Button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-muted-foreground">
              Solicite sus credenciales al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
