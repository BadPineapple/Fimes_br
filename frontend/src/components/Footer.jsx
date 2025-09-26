import React from "react";
import { Link } from "react-router-dom";
import ContactUsDialog from "./ContactUsDialog";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 via-yellow-600 to-blue-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Filmes.br</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              A maior plataforma de cinema brasileiro. Descubra, avalie e compartilhe sua paixão.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <div className="space-y-2 text-sm">
              <div><Link to="/films" className="hover:text-yellow-200">Todos os Filmes</Link></div>
              <div><Link to="/encontrar" className="hover:text-yellow-200">IA Recomenda</Link></div>
              <div><Link to="/apoie" className="hover:text-yellow-200">Apoie o Projeto</Link></div>
              <div><a href="https://apoia.se/filmesbr" target="_blank" rel="noreferrer" className="hover:text-yellow-200">Apoia.se</a></div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato & Suporte</h4>
            <div className="space-y-2 text-sm">
              <div className="mb-3"><ContactUsDialog /></div>
              <div>Email: contato@filmes.br</div>
              <div>Suporte: ajuda@filmes.br</div>
              <div className="pt-2">
                <p className="text-xs opacity-75">Plataforma dedicada ao cinema brasileiro • Feito com ❤️</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-75">
          <p>&copy; 2025 Filmes.br - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
