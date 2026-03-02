import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import MoviesPage from './pages/MoviePages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* A rota com path="/" define qual componente é a HOME */}
          <Route path="/" element={<Home />} />
          
          {/* Outras rotas do seu sistema */}
          <Route path="/filmes" element={<MoviesPage />} />
          
          {/* Rota de fallback (404) caso o usuário digite algo errado */}
          <Route path="*" element={<h1>Página não encontrada!</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}