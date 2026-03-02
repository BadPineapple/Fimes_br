import React from "react";
import { Link } from "react-router-dom";
import { Film as FilmIcon, Star } from "lucide-react";

export default function FilmCard({ film }) {
  if (!film) return null;

  // 1. Adaptação dos nomes (Mapeando Inglês -> Português do seu Banco)
  // O seu backend usa imagem_capa ou a URL que definimos na rota de upload
  const cover = film.imagem_capa || film.poster_url || null; 
  const title = film.titulo || "Sem título";
  const year = film.ano || null;

  // 2. Adaptação da Nota
  const ratingRaw = film.nota || film.rating || null;
  const ratingText = ratingRaw != null ? Number(ratingRaw).toFixed(1) : null;

  // 3. Adaptação das Tags (Transformando string "Ação, Drama" em Array)
  const tags = typeof film.genero === 'string' 
    ? film.genero.split(',').map(g => g.trim()) 
    : Array.isArray(film.generos) ? film.generos : [];
    
  const topTags = tags.slice(0, 2);

  // 4. Ajuste da Rota (O seu backend usa /filmes)
  const to = `/filmes/${film.id}`;
  const aria = `Ver detalhes do filme: ${title}`;

  return (
    <Link to={to} aria-label={aria} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 h-full flex flex-col">
        
        {/* Container da Imagem */}
        <div className="aspect-[2/3] bg-gradient-to-br from-green-100 to-yellow-100 relative overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={`Capa de ${title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FilmIcon size={48} className="text-green-600/30" />
            </div>
          )}
        </div>

        {/* Conteúdo do Card */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 h-10">
            {title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
            {year && <span>{year}</span>}
            {ratingText && (
              <div className="flex items-center gap-1 font-semibold text-yellow-700">
                <Star size={12} fill="currentColor" className="text-yellow-500" />
                <span>{ratingText}</span>
              </div>
            )}
          </div>

          {/* Tags / Gêneros */}
          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {topTags.map((tag, i) => (
                <span 
                  key={`${tag}-${i}`} 
                  className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}