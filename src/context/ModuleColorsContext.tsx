import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface ModuleColors {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: 'corporativo',
    name: 'Azul Corporativo',
    description: 'Colores profesionales y elegantes',
    colors: {
      primaryColor: '#1e3a5f',
      secondaryColor: '#2d4a6f',
      accentColor: '#c9a227',
    },
  },
  {
    id: 'naturaleza',
    name: 'Verde Naturaleza',
    description: 'Tonos frescos y naturales',
    colors: {
      primaryColor: '#1a5f3c',
      secondaryColor: '#2d7a50',
      accentColor: '#f4a940',
    },
  },
  {
    id: 'moderno',
    name: 'Rojo Moderno',
    description: 'Estilo audaz y contemporáneo',
    colors: {
      primaryColor: '#8b1e3f',
      secondaryColor: '#a83254',
      accentColor: '#e6b800',
    },
  },
  {
    id: 'oceano',
    name: 'Océano Profundo',
    description: 'Tonos marinos y relajantes',
    colors: {
      primaryColor: '#0f3460',
      secondaryColor: '#16537e',
      accentColor: '#00d4ff',
    },
  },
  {
    id: 'purpura',
    name: 'Púrpura Elegante',
    description: 'Sofisticado y distintivo',
    colors: {
      primaryColor: '#4a1a6b',
      secondaryColor: '#6b2d8a',
      accentColor: '#ff6b9d',
    },
  },
];

const defaultModuleColors: ModuleColors[] = [
  { id: 'generador', name: 'Generador de Cotizaciones', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'historial', name: 'Historial', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'asesores', name: 'Asesores', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'normas', name: 'Normas ISO', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'bancos', name: 'Cuentas Bancarias', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
  { id: 'flujo', name: 'Flujo de Certificación', primaryColor: '#1e3a5f', secondaryColor: '#2d4a6f', accentColor: '#c9a227' },
];

interface ModuleColorsContextType {
  moduleColors: ModuleColors[];
  setModuleColors: React.Dispatch<React.SetStateAction<ModuleColors[]>>;
  getModuleColors: (moduleId: string) => ModuleColors;
  updateModuleColor: (moduleId: string, colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => void;
  applyThemeToAll: (theme: ThemePreset) => void;
  applyThemeToModule: (moduleId: string, theme: ThemePreset) => void;
  resetToDefaults: () => void;
  resetModule: (moduleId: string) => void;
  saveColors: () => void;
}

const ModuleColorsContext = createContext<ModuleColorsContextType | undefined>(undefined);

export const ModuleColorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moduleColors, setModuleColors] = useState<ModuleColors[]>(() => {
    const saved = localStorage.getItem('moduleColors');
    return saved ? JSON.parse(saved) : defaultModuleColors;
  });

  const getModuleColors = (moduleId: string): ModuleColors => {
    return moduleColors.find(m => m.id === moduleId) || defaultModuleColors[0];
  };

  const updateModuleColor = (moduleId: string, colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setModuleColors(prev =>
      prev.map(module =>
        module.id === moduleId
          ? { ...module, [colorType]: value }
          : module
      )
    );
  };

  const applyThemeToAll = (theme: ThemePreset) => {
    setModuleColors(prev =>
      prev.map(module => ({
        ...module,
        primaryColor: theme.colors.primaryColor,
        secondaryColor: theme.colors.secondaryColor,
        accentColor: theme.colors.accentColor,
      }))
    );
  };

  const applyThemeToModule = (moduleId: string, theme: ThemePreset) => {
    setModuleColors(prev =>
      prev.map(module =>
        module.id === moduleId
          ? {
              ...module,
              primaryColor: theme.colors.primaryColor,
              secondaryColor: theme.colors.secondaryColor,
              accentColor: theme.colors.accentColor,
            }
          : module
      )
    );
  };

  const resetToDefaults = () => {
    setModuleColors(defaultModuleColors);
    localStorage.removeItem('moduleColors');
  };

  const resetModule = (moduleId: string) => {
    const defaultModule = defaultModuleColors.find(m => m.id === moduleId);
    if (defaultModule) {
      setModuleColors(prev =>
        prev.map(module =>
          module.id === moduleId ? defaultModule : module
        )
      );
    }
  };

  const saveColors = () => {
    localStorage.setItem('moduleColors', JSON.stringify(moduleColors));
  };

  // Auto-save when colors change
  useEffect(() => {
    localStorage.setItem('moduleColors', JSON.stringify(moduleColors));
  }, [moduleColors]);

  return (
    <ModuleColorsContext.Provider
      value={{
        moduleColors,
        setModuleColors,
        getModuleColors,
        updateModuleColor,
        applyThemeToAll,
        applyThemeToModule,
        resetToDefaults,
        resetModule,
        saveColors,
      }}
    >
      {children}
    </ModuleColorsContext.Provider>
  );
};

export const useModuleColors = () => {
  const context = useContext(ModuleColorsContext);
  if (!context) {
    throw new Error('useModuleColors must be used within ModuleColorsProvider');
  }
  return context;
};

// Hook para obtener los estilos de un módulo específico
export const useModuleStyles = (moduleId: string) => {
  const { moduleColors } = useModuleColors();
  
  const colors = useMemo(() => {
    return moduleColors.find(m => m.id === moduleId) || moduleColors[0];
  }, [moduleColors, moduleId]);

  const styles = useMemo(() => ({
    colors,
    headerStyle: {
      background: `linear-gradient(180deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
    },
    sectionNumberStyle: {
      background: `linear-gradient(180deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
      color: 'white',
    },
    accentButtonStyle: {
      backgroundColor: colors.accentColor,
    },
    tableHeaderStyle: {
      background: `linear-gradient(180deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
      color: 'white',
    },
  }), [colors]);

  return styles;
};
