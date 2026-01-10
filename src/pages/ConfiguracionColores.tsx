import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Save, RotateCcw, FileText, History, Users, Settings, Building2, GitBranch, Eye, LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModuleColors {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Icon map - separado del estado para evitar problemas de serialización
const iconMap: Record<string, LucideIcon> = {
  generador: FileText,
  historial: History,
  asesores: Users,
  normas: Settings,
  bancos: Building2,
  flujo: GitBranch,
};

const defaultModuleColors: ModuleColors[] = [
  { id: 'generador', name: 'Generador de Cotizaciones', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'historial', name: 'Historial', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'asesores', name: 'Asesores', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'normas', name: 'Normas ISO', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'bancos', name: 'Cuentas Bancarias', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'flujo', name: 'Flujo de Certificación', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
];

const ConfiguracionColores = () => {
  const { toast } = useToast();
  const [moduleColors, setModuleColors] = useState<ModuleColors[]>(() => {
    const saved = localStorage.getItem('moduleColors');
    return saved ? JSON.parse(saved) : defaultModuleColors;
  });
  const [previewModule, setPreviewModule] = useState<string | null>(null);

  const handleColorChange = (moduleId: string, colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setModuleColors(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, [colorType]: value }
          : module
      )
    );
  };

  const handleSave = () => {
    localStorage.setItem('moduleColors', JSON.stringify(moduleColors));
    toast({
      title: "Colores guardados",
      description: "La configuración de colores se ha guardado correctamente.",
    });
  };

  const handleReset = () => {
    setModuleColors(defaultModuleColors);
    localStorage.removeItem('moduleColors');
    toast({
      title: "Colores restaurados",
      description: "Se han restaurado los colores predeterminados.",
    });
  };

  const handleResetModule = (moduleId: string) => {
    const defaultModule = defaultModuleColors.find(m => m.id === moduleId);
    if (defaultModule) {
      setModuleColors(prev =>
        prev.map(module =>
          module.id === moduleId ? defaultModule : module
        )
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="section-number">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-gradient">Configuración de Colores</h2>
              <p className="text-muted-foreground text-sm">Personaliza los colores de cada módulo del sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restaurar Todo
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-gradient-corporate hover:opacity-90">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        {/* Color Legend */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-corporate-dark"></div>
                <span className="text-muted-foreground">Color Primario: Fondos principales, encabezados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-corporate-medium"></div>
                <span className="text-muted-foreground">Color Secundario: Gradientes, bordes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gold"></div>
                <span className="text-muted-foreground">Color Acento: Destacados, botones</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moduleColors.map((module) => {
            const Icon = iconMap[module.id] || FileText;
            return (
              <Card key={module.id} className="overflow-hidden">
                <CardHeader 
                  className="text-white py-3"
                  style={{ 
                    background: `linear-gradient(180deg, ${module.primaryColor}, ${module.secondaryColor})` 
                  }}
                >
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="w-5 h-5" />
                    {module.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Color Inputs */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Primario</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={module.primaryColor}
                          onChange={(e) => handleColorChange(module.id, 'primaryColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.primaryColor}
                          onChange={(e) => handleColorChange(module.id, 'primaryColor', e.target.value)}
                          className="text-xs h-8"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Secundario</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={module.secondaryColor}
                          onChange={(e) => handleColorChange(module.id, 'secondaryColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.secondaryColor}
                          onChange={(e) => handleColorChange(module.id, 'secondaryColor', e.target.value)}
                          className="text-xs h-8"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Acento</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={module.accentColor}
                          onChange={(e) => handleColorChange(module.id, 'accentColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.accentColor}
                          onChange={(e) => handleColorChange(module.id, 'accentColor', e.target.value)}
                          className="text-xs h-8"
                          placeholder="#c9a227"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                        style={{ background: `linear-gradient(180deg, ${module.primaryColor}, ${module.secondaryColor})` }}
                      >
                        1
                      </div>
                      <div 
                        className="flex-1 h-8 rounded flex items-center px-3 text-white text-sm"
                        style={{ background: `linear-gradient(180deg, ${module.primaryColor}, ${module.secondaryColor})` }}
                      >
                        Encabezado de tabla
                      </div>
                      <Button 
                        size="sm"
                        className="text-white text-xs"
                        style={{ backgroundColor: module.accentColor }}
                      >
                        Botón
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleResetModule(module.id)}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Global Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vista Previa Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {moduleColors.map((module) => {
                const Icon = iconMap[module.id] || FileText;
                return (
                  <div 
                    key={module.id}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-white p-2 cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(180deg, ${module.primaryColor}, ${module.secondaryColor})` }}
                    onClick={() => setPreviewModule(previewModule === module.id ? null : module.id)}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs text-center leading-tight">{module.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConfiguracionColores;
