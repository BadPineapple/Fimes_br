// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Film } from "lucide-react";
import FilmCard from "../components/MovieCard"; // O Card que adaptámos anteriormente
import { Link } from "react-router-dom";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        // Aproveitando a nossa função global do backend!
        // Trazemos apenas 12 filmes, ordenados pelos mais recentes (ID decrescente)
        const response = await api.get("/filmes", {
          params: { limite: 12, ordem: 'id', direcao: 'DESC' }
        });
        
        if (!mounted) return;

        // A nossa API devolve os itens dentro de 'dados' (junto com a 'paginacao')
        const items = response.data.dados || [];
        setFeatured(items);

      } catch (e) {
        console.error("Erro na API:", e);
        // Fallback simples caso não tenhas a biblioteca de Toast instalada
        alert("Erro ao carregar filmes em destaque.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-2xl text-green-800 font-bold animate-pulse">
          Carregando filmes brasileiros...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      
      {/* Banner / Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-800 via-yellow-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">Descubra o Melhor do Cinema Brasileiro</h1>
            <p className="text-xl max-w-2xl text-gray-200">
              De clássicos atemporais às mais recentes produções nacionais.
            </p>
            {/* Botão substituído por Link com Tailwind puro */}
            <Link 
              to="/filmes" 
              aria-label="Explorar filmes"
              className="inline-block mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-md transition-colors text-lg"
            >
              Explorar Filmes
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Filmes em Destaque */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8">Lançamentos em Destaque</h2>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {featured.map((f) => (
                <FilmCard key={f.id} film={f} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-green-100">
              <Film size={64} className="mx-auto text-green-600/50 mb-4" aria-hidden="true" />
              <p className="text-green-800 text-lg font-medium">Nenhum filme encontrado.</p>
              <p className="text-sm text-green-600/70 mt-2">Verifique se o seu banco de dados MySQL tem registros.</p>
            </div>
          )}
        </div>
      </section>
      
    </div>
  );
}