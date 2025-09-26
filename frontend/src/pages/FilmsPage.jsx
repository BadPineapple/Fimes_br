import React from "react";
import api from "../services/api";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Film, Search } from "lucide-react";
import FilmCard from "../components/FilmCard";

export default function FilmsPage() {
  const [films, setFilms] = React.useState([]);
  const [genres, setGenres] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState("");

  React.useEffect(()=>{ (async ()=>{
    try {
      const [f, g] = await Promise.all([api.get("/films"), api.get("/films/genres")]);
      setFilms(f.data); setGenres(g.data);
    } catch(e){ console.error(e); }
    setLoading(false);
  })(); }, []);

  const fetchByGenre = async (genre) => {
    try { 
      const r = genre ? await api.get(`/films/by-genre/${genre}`) : await api.get("/films");
      setFilms(r.data);
    } catch(e){ console.error(e); }
  };

  const handleGenre = (g) => { setSelectedGenre(g); setSearchTerm(""); fetchByGenre(g); };

  const filtered = films.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="flex items-center justify-center h-64"><div className="text-2xl text-green-800">Carregando filmografia...</div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Filmografia Brasileira</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar filmes..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-green-800">Filtrar por gênero:</label>
              <select value={selectedGenre} onChange={(e)=>handleGenre(e.target.value)} className="px-4 py-2 border border-green-300 rounded-md bg-white text-green-800">
                <option value="">Todos</option>
                {genres.map((g,i)=><option key={i} value={g.genre}>{g.genre} ({g.count})</option>)}
              </select>
            </div>
          </div>
          {selectedGenre && (
            <div className="mb-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Filtrando por: {selectedGenre}
                <button onClick={()=>handleGenre("")} className="ml-2 text-green-600 hover:text-green-800">✕</button>
              </Badge>
            </div>
          )}
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filtered.map(f => <FilmCard key={f.id} film={f} />)}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film size={64} className="mx-auto text-green-600 mb-4" />
            <p className="text-green-700 text-lg">{searchTerm ? `Nenhum filme encontrado para "${searchTerm}"` : "Nenhum filme encontrado"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
