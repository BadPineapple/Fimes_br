import { Star } from 'lucide-react';

export function MovieCard({ filme }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100">
      {/* Área da Imagem / Placeholder */}
      <div className="aspect-[4/5] bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center">
        <Film size={48} className="text-green-600/30" />
      </div>

      {/* Informações */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{filme.titulo}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span>{filme.ano}</span>
          <div className="flex items-center gap-1 text-yellow-600 font-medium">
            <Star size={14} fill="currentColor" />
            {filme.nota || '8.5'}
          </div>
        </div>

        {/* Tags de Gênero */}
        <div className="flex gap-2 mt-4">
          {/* Supondo que o gênero venha como string separada por vírgula ou array */}
          {filme.genero.split(',').map((g) => (
            <span key={g} className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded">
              {g.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}