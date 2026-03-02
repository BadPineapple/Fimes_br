import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";
import Filmes from "./pages/Filmes";
import FilmeDetalhe from "./pages/FilmeDetalhe";
import Indicacao from "./pages/Indicacao";
import Apoio from "./pages/Apoio";
import Entrar from "./pages/Entrar";
import Registrar from "./pages/Registrar";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/filmes" element={<Filmes />} />
            <Route path="/filme/:id" element={<FilmeDetalhe />} />
            <Route path="/indicacao" element={<Indicacao />} />
            <Route path="/apoio" element={<Apoio />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
