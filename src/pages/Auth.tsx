import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Mail, Phone, LogIn, UserPlus } from 'lucide-react';
import logoCcd from '@/assets/logo-ccd.jpg';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Error de inicio de sesión',
            description: error.message === 'Invalid login credentials' 
              ? 'Credenciales inválidas. Verifique su correo y contraseña.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: '¡Bienvenido!',
            description: 'Inicio de sesión exitoso',
          });
          navigate('/');
        }
      } else {
        if (!name.trim()) {
          toast({
            title: 'Error',
            description: 'El nombre es obligatorio',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, { name, phone });
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Error de registro',
              description: 'Este correo ya está registrado. Intente iniciar sesión.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error de registro',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: '¡Registro exitoso!',
            description: 'Su cuenta ha sido creada. Ya puede iniciar sesión.',
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
              {isLogin ? 'Ingrese sus credenciales' : 'Registre su cuenta de asesor'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="form-label form-label-required">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingrese su nombre"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label form-label-required">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label form-label-required">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="form-label">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="999999999"
                    className="pl-10"
                    disabled={loading}
                    maxLength={9}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? '¿No tiene una cuenta?' : '¿Ya tiene una cuenta?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline ml-1 font-medium"
                disabled={loading}
              >
                {isLogin ? 'Regístrese' : 'Inicie sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
