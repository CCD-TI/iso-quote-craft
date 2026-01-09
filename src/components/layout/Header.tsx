import { Link, useLocation } from 'react-router-dom';
import { FileText, Users, Settings, History, Building2 } from 'lucide-react';
import logoCCD from '@/assets/logo-ccd.jpg';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Generador', icon: FileText },
    { path: '/historial', label: 'Historial', icon: History },
    { path: '/asesores', label: 'Asesores', icon: Users },
    { path: '/normas', label: 'Normas ISO', icon: Settings },
    { path: '/bancos', label: 'Bancos', icon: Building2 },
  ];

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logoCCD} alt="CCD Logo" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <h1 className="text-lg font-heading font-bold leading-tight">
                  Generador de Cotizaciones ISO
                </h1>
                <p className="text-xs text-primary-foreground/80">
                  CCD - Centro de Capacitación y Desarrollo
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;