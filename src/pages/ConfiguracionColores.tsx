import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Save, RotateCcw, FileText, History, Users, Settings, Building2, GitBranch, Eye, Sparkles, LucideIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModuleColors, themePresets } from '@/context/ModuleColorsContext';

// Icon map - separado del estado para evitar problemas de serialización
const iconMap: Record<string, LucideIcon> = {
  generador: FileText,
  historial: History,
  asesores: Users,
  normas: Settings,
  bancos: Building2,
  flujo: GitBranch,
};

const ConfiguracionColores = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    moduleColors, 
    updateModuleColor, 
    applyThemeToAll, 
    resetToDefaults, 
    resetModule,
    saveColors 
  } = useModuleColors();

  const handleSave = () => {
    saveColors();
    toast({
      title: "✅ Colores aplicados",
      description: "Los cambios se han guardado. Navega a cualquier módulo para ver los nuevos colores.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Colores restaurados",
      description: "Se han restaurado los colores predeterminados.",
    });
  };

  const handleApplyTheme = (themeId: string) => {
    const theme = themePresets.find(t => t.id === themeId);
    if (theme) {
      applyThemeToAll(theme);
      toast({
        title: `Tema "${theme.name}" aplicado`,
        description: "Los colores se han actualizado en todos los módulos.",
      });
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

        {/* Admin Quick Access */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Accesos de Administración
            </CardTitle>
            <CardDescription>Gestiona los módulos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { path: '/archivos', label: 'Archivos', icon: Upload },
                { path: '/asesores', label: 'Asesores', icon: Users },
                { path: '/normas', label: 'Normas ISO', icon: Settings },
                { path: '/bancos', label: 'Bancos', icon: Building2 },
                { path: '/flujo-certificacion', label: 'Flujo', icon: GitBranch },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.path}
                    onClick={() => navigate(option.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Theme Presets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Temas Predefinidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {themePresets.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleApplyTheme(theme.id)}
                  className="group relative rounded-lg p-3 border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div 
                    className="h-16 rounded-md mb-2 shadow-inner"
                    style={{ 
                      background: `linear-gradient(180deg, ${theme.colors.primaryColor}, ${theme.colors.secondaryColor})` 
                    }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full absolute top-4 right-4 border-2 border-white shadow"
                      style={{ backgroundColor: theme.colors.accentColor }}
                    />
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                          onChange={(e) => updateModuleColor(module.id, 'primaryColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.primaryColor}
                          onChange={(e) => updateModuleColor(module.id, 'primaryColor', e.target.value)}
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
                          onChange={(e) => updateModuleColor(module.id, 'secondaryColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.secondaryColor}
                          onChange={(e) => updateModuleColor(module.id, 'secondaryColor', e.target.value)}
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
                          onChange={(e) => updateModuleColor(module.id, 'accentColor', e.target.value)}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={module.accentColor}
                          onChange={(e) => updateModuleColor(module.id, 'accentColor', e.target.value)}
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
                      onClick={() => resetModule(module.id)}
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