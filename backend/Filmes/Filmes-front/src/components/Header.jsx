// src/components/Navigation.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
// O LoginDialog continua, certifique-se de que o arquivo existe!
//import LoginDialog from "./LoginDialog"; 
import { Home, Film, Search, Star, MessageSquare, Menu, X, User as UserIcon } from "lucide-react";

// Ajuste na pasta do Context (singular)
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ajuste da Rota e da verificação de Roles (Array)
  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/filmes", icon: Film, label: "Filmes" }, // Corrigido para /filmes
    { to: "/encontrar", icon: Search, label: "Encontrar" },
    { to: "/apoie", icon: Star, label: "Apoie" },
    // Verifica se o array 'roles' existe e se contém 'admin' ou 'moderator'
    ...(user?.roles?.includes("admin") || user?.roles?.includes("moderator")
      ? [{ to: "/moderator", icon: MessageSquare, label: "Dashboard", special: true }]
      : []),
  ];

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [sidebarOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    if (sidebarOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Ajuste para ler user.nome (do nosso MySQL) em vez de user.name
  const nomeUsuario = user?.nome || user?.usuario || "Usuário";
  const initial = nomeUsuario.trim()[0].toUpperCase();

  return (
    <>
      <nav className="bg-gradient-to-r from-yellow-600 via-green-700 to-blue-800 shadow-lg" aria-label="Navegação principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-white tracking-wider">
                Filmes.br
              </Link>

              <div className="hidden md:flex space-x-6">
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        [
                          "text-white flex items-center gap-2 transition font-medium",
                          isActive ? "underline underline-offset-4" : "hover:text-yellow-200",
                          it.special ? "bg-blue-600/80 px-3 py-1.5 rounded-md hover:bg-blue-600" : "",
                        ].join(" ")
                      }
                    >
                      <Icon size={18} />
                      {it.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white hover:text-yellow-200">
                <Menu size={24} />
              </button>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <>
                    <Link to="/profile" className="text-white hover:text-yellow-200 flex items-center gap-3">
                      <span className="font-medium">Olá, {nomeUsuario}</span>
                      {/* Avatar feito com Tailwind puro para evitar erros do Shadcn UI */}
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/50 text-sm font-bold">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                    </Link>
                    {/* Botão feito com Tailwind puro */}
                    <button 
                      onClick={logout} 
                      className="border border-white/50 text-white hover:bg-white/10 px-4 py-1.5 rounded-md transition text-sm font-medium"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <LoginDialog />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar mobile (Menu Lateral) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-yellow-600 via-green-700 to-blue-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Filmes.br</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-yellow-200">
                <X size={24} />
              </button>
            </div>

            <div className="py-4 flex-grow">
              <div className="px-4 pb-4 border-b border-white/20">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white text-green-800 flex items-center justify-center font-bold text-lg">
                        {initial}
                      </div>
                      <div>
                        <p className="text-white font-medium">{nomeUsuario}</p>
                        <p className="text-yellow-200 text-xs">Ver perfil</p>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="px-2">
                    <LoginDialog />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1">
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 px-6 py-3 text-white transition",
                          isActive ? "bg-white/20 border-l-4 border-yellow-300" : "hover:bg-white/10",
                          it.special ? "bg-blue-600/30" : "",
                        ].join(" ")
                      }
                    >
                      <Icon size={20} />
                      <span className="font-medium">{it.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Botão de Sair no Mobile fixo em baixo */}
            {user && (
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="flex items-center gap-2 text-yellow-200 hover:text-white w-full px-2 py-2 transition"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}