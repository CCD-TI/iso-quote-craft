import { useAuth } from '@/context/AuthContext';
import { ClientData } from '@/types/quotation';
import { ModuleColors } from '@/context/ModuleColorsContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';

interface ClientDataFormProps {
  data: ClientData;
  onChange: (data: ClientData) => void;
  moduleColors: ModuleColors;
}

const ClientDataForm = ({ data, onChange, moduleColors }: ClientDataFormProps) => {
  const { advisor } = useAuth();
  const { getNextQuotationCode } = useApp();

  // Auto-set advisor when component mounts or advisor changes
  useEffect(() => {
    if (advisor && data.asesorId !== advisor.id) {
      onChange({ ...data, asesorId: advisor.id });
    }
  }, [advisor]);

  const handleChange = async (field: keyof ClientData, value: string | Date) => {
    const newData = { ...data, [field]: value };
    
    if (field === 'fecha') {
      const newCode = await getNextQuotationCode(value as Date);
      newData.codigo = newCode;
    }
    
    onChange(newData);
  };

  const sectionNumberStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
  };

  const sectionTitleStyle = {
    background: `linear-gradient(180deg, ${moduleColors.primaryColor}, ${moduleColors.secondaryColor})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div className="card-corporate animate-fade-in">
      <div className="flex items-center gap-3 text-lg font-semibold mb-4">
        <span 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
          style={sectionNumberStyle}
        >
          1
        </span>
        <span style={sectionTitleStyle}>Datos del Cliente</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label form-label-required">RUC</label>
          <input
            type="text"
            value={data.ruc}
            onChange={(e) => handleChange('ruc', e.target.value)}
            className="input-corporate"
            placeholder="Ingrese RUC"
            maxLength={11}
          />
        </div>

        <div>
          <label className="form-label form-label-required">Razón Social</label>
          <input
            type="text"
            value={data.razonSocial}
            onChange={(e) => handleChange('razonSocial', e.target.value)}
            className="input-corporate"
            placeholder="Ingrese razón social"
          />
        </div>

        <div>
          <label className="form-label form-label-required">
            Nombre del Representante
          </label>
          <input
            type="text"
            value={data.representante}
            onChange={(e) => handleChange('representante', e.target.value)}
            className="input-corporate"
            placeholder="Ingrese nombre del representante"
          />
        </div>

        <div>
          <label className="form-label form-label-required">Celular</label>
          <input
            type="tel"
            value={data.celular}
            onChange={(e) => handleChange('celular', e.target.value)}
            className="input-corporate"
            placeholder="Ingrese celular"
            maxLength={15}
          />
        </div>

        <div>
          <label className="form-label">Correo Electrónico</label>
          <input
            type="email"
            value={data.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            className="input-corporate"
            placeholder="Ingrese correo electrónico"
          />
        </div>

        {/* Asesor - Now shown as read-only with logged in advisor */}
        <div>
          <label className="form-label">Asesor</label>
          <div className="input-corporate flex items-center gap-2 bg-muted/50">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {advisor?.name || 'Sin asesor asignado'}
            </span>
          </div>
        </div>

        <div>
          <label className="form-label form-label-required">Fecha</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal input-corporate",
                  !data.fecha && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.fecha ? format(data.fecha, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.fecha}
                onSelect={(date) => date && handleChange('fecha', date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="form-label form-label-required">Código</label>
          <input
            type="text"
            value={data.codigo}
            className="input-corporate"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDataForm;
