import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Users, Settings, Building2, GitBranch, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

const ADMIN_CODE = 'CcD2027@ok@2';

const Administracion = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración",
      });
    } else {
      toast({
        title: "Acceso denegado",
        description: "Código incorrecto. Contacte con el administrador.",
        variant: "destructive",
      });
    }
    setCode('');
  };

  const adminOptions = [
    { path: '/archivos', label: 'Archivos', icon: Upload, description: 'Gestionar archivos PDF adjuntos' },
    { path: '/asesores', label: 'Asesores', icon: Users, description: 'Administrar asesores comerciales' },
    { path: '/normas', label: 'Normas ISO', icon: Settings, description: 'Configurar normas y precios' },
    { path: '/bancos', label: 'Bancos', icon: Building2, description: 'Gestionar cuentas bancarias' },
    { path: '/flujo-certificacion', label: 'Flujo de Certificación', icon: GitBranch, description: 'Configurar pasos del proceso' },
  ];

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription>
                Ingrese el código de seguridad para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Seguridad</Label>
                  <Input
                    id="code"
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ingrese el código"
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">Acceso Autorizado</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">Seleccione una opción para gestionar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {adminOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.path} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-primary"
                onClick={() => navigate(option.path)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{option.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="text-muted-foreground"
          >
            <Lock className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Administracion;
