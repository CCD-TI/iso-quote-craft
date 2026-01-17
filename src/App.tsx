import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ModuleColorsProvider } from "@/context/ModuleColorsContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Historial from "./pages/Historial";
import Archivos from "./pages/Archivos";
import Asesores from "./pages/Asesores";
import Normas from "./pages/Normas";
import Bancos from "./pages/Bancos";
import FlujoCertificacion from "./pages/FlujoCertificacion";
import ConfiguracionColores from "./pages/ConfiguracionColores";
import Administracion from "./pages/Administracion";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <ModuleColorsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />
                <Route path="/archivos" element={<ProtectedRoute><Archivos /></ProtectedRoute>} />
                <Route path="/asesores" element={<ProtectedRoute><Asesores /></ProtectedRoute>} />
                <Route path="/normas" element={<ProtectedRoute><Normas /></ProtectedRoute>} />
                <Route path="/bancos" element={<ProtectedRoute><Bancos /></ProtectedRoute>} />
                <Route path="/flujo-certificacion" element={<ProtectedRoute><FlujoCertificacion /></ProtectedRoute>} />
                <Route path="/configuracion-colores" element={<ProtectedRoute><ConfiguracionColores /></ProtectedRoute>} />
                <Route path="/administracion" element={<ProtectedRoute><Administracion /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ModuleColorsProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
