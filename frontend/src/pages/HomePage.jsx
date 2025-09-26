import React from "react";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Film } from "lucide-react";
import FilmCard from "../components/FilmCard";

export default function HomePage() {
  const [featured, setFeatured] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{ (async ()=>{
    try { const r = await api.get("/films/featured"); setFeatured(r.data); } catch(e){ console.error(e); }
    setLoading(false);
  })(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="flex items-center justify-center h-64"><div className="text-2xl text-green-800">Carregando filmes brasileiros...</div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <section className="relative h-96 bg-gradient-to-r from-green-800 via-yellow-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold">Descubra o Melhor do Cinema Brasileiro</h1>
            <p className="text-xl max-w-2xl">De clássicos atemporais às mais recentes produções nacionais.</p>
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">Explorar Filmes</Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8">Filmes em Destaque</h2>
          {featured.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {featured.map(f => <FilmCard key={f.id} film={f} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film size={64} className="mx-auto text-green-600 mb-4" />
              <p className="text-green-700 text-lg">Nenhum filme encontrado.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
