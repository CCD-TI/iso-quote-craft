import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import Historial from "./pages/Historial";
import Asesores from "./pages/Asesores";
import Normas from "./pages/Normas";
import Bancos from "./pages/Bancos";
import FlujoCertificacion from "./pages/FlujoCertificacion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/asesores" element={<Asesores />} />
            <Route path="/normas" element={<Normas />} />
            <Route path="/bancos" element={<Bancos />} />
            <Route path="/flujo-certificacion" element={<FlujoCertificacion />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;