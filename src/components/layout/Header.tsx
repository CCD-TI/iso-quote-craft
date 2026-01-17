import { Link, useLocation } from 'react-router-dom';
import { FileText, History, Shield, Palette, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoCCD from '@/assets/logo-ccd.jpg';

const Header = () => {
  const location = useLocation();
  const { advisor, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Generador', icon: FileText },
    { path: '/historial', label: 'Historial', icon: History },
    { path: '/administracion', label: 'Administración', icon: Shield },
    { path: '/configuracion-colores', label: 'Colores', icon: Palette },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-gradient-corporate text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logoCCD} alt="CCD Logo" className="h-10 w-10 rounded-full object-cover border-2 border-white/30" />
              <div>
                <h1 className="text-lg font-heading font-bold leading-tight">
                  Generador de Cotizaciones ISO
                </h1>
                <p className="text-xs text-white/80">
                  CCD - Centro de Capacitación y Desarrollo
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {advisor?.name || 'Usuario'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{advisor?.name}</p>
                  <p className="text-xs text-muted-foreground">{advisor?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
