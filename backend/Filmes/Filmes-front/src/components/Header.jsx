import { Link } from 'react-router-dom';
import { Home, Film, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-[#1a1a1a] text-white py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-gray-100">Filmes.br</h1>
        <nav className="flex gap-6 text-gray-400">
          <Link to="/" className="flex items-center gap-2 hover:text-white transition">
            <Home size={18} /> Home
          </Link>
          <Link to="/filmes" className="flex items-center gap-2 hover:text-white transition">
            <Film size={18} /> Filmes
          </Link>
          <Link to="/busca" className="flex items-center gap-2 hover:text-white transition">
            <Search size={18} /> Encontrar
          </Link>
        </nav>
      </div>

      <Link 
        to="/login" 
        className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 transition"
      >
        <User size={18} /> Entrar
      </Link>
    </header>
  );
}