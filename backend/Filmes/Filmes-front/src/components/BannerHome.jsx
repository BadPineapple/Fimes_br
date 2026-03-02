import { Info, Play } from 'lucide-react';

export function Banner() {
  return (
    <div className="relative w-full h-[500px] bg-gray-900 overflow-hidden">
      {/* Imagem de Fundo (Placeholder de um filme brasileiro épico) */}
      <img 
        src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=2070" 
        alt="Destaque do Mês"
        className="w-full h-full object-cover opacity-60"
      />
      
      {/* Overlay de Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-12">
        <span className="text-green-400 font-bold tracking-widest uppercase mb-4">Destaque da Semana</span>
        <h2 className="text-6xl font-black text-white mb-4 max-w-2xl">O Auto da Compadecida 2</h2>
        <p className="text-gray-300 text-lg max-w-xl mb-8">
          O retorno triunfal de João Grilo e Chicó em uma nova aventura pelo sertão nordestino.
        </p>
        
        <div className="flex gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition">
            <Play size={20} fill="currentColor" /> Assistir Agora
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 backdrop-blur-md transition">
            <Info size={20} /> Mais Informações
          </button>
        </div>
      </div>
    </div>
  );
}