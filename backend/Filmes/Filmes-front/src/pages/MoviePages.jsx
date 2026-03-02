import { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { MovieCard } from '../components/MovieCard';
import { Search, ChevronDown } from 'lucide-react';

export function MoviesPage() {
  const [filmes, setFilmes] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function loadFilmes() {
      // Usando a rota GET que refatoramos para MySQL
      const response = await api.get('/filmes', { params: { q: busca } });
      setFilmes(response.data);
    }
    loadFilmes();
  }, [busca]);

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold text-green-900 mb-8">Filmografia Brasileira</h2>

        {/* Barra de Filtros */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar filmes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 text-gray-600 font-medium">
            <span>Filtrar por gênero:</span>
            <div className="relative bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-8 cursor-pointer hover:bg-gray-50 transition">
              <span>Drama (6)</span>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Grid de Filmes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {filmes.map(filme => (
            <MovieCard key={filme.id} filme={filme} />
          ))}
        </div>
      </main>
    </div>
  );
}