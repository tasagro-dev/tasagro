
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TasarCampo from "./pages/TasarCampo";
import NuevaTasacion from "./pages/NuevaTasacion";
import MisTasaciones from "./pages/MisTasaciones";
import PublicarCampo from "./pages/PublicarCampo";
import MisPublicaciones from "./pages/MisPublicaciones";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tasar-campo" element={<TasarCampo />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/nueva-tasacion" element={<NuevaTasacion />} />
          <Route path="/dashboard/mis-tasaciones" element={<MisTasaciones />} />
          <Route path="/dashboard/publicar-campo" element={<PublicarCampo />} />
          <Route path="/dashboard/mis-publicaciones" element={<MisPublicaciones />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
