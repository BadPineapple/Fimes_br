import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import LoginDialog from "./LoginDialog";
import { Home, Film, Search, Star, MessageSquare, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/films", icon: Film, label: "Filmes" },
    { to: "/encontrar", icon: Search, label: "Encontrar" },
    { to: "/apoie", icon: Star, label: "Apoie" },
    ...(user?.role === "moderator" ? [{ to: "/moderator", icon: MessageSquare, label: "Dashboard", special: true }] : [])
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-yellow-600 via-green-700 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-white">Filmes.br</Link>
              <div className="hidden md:flex space-x-6">
                {items.map((it) => (
                  <Link key={it.to} to={it.to}
                        className={`text-white hover:text-yellow-200 flex items-center gap-2 ${it.special ? "bg-blue-600 px-3 py-1 rounded" : ""}`}>
                    <it.icon size={18} />{it.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={()=>setSidebarOpen(true)} className="md:hidden text-white hover:text-yellow-200"><Menu size={24}/></button>
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <>
                    <Link to="/profile" className="text-white hover:text-yellow-200 flex items-center gap-2">
                      <span>Olá, {user.name}</span>
                      <Avatar><AvatarImage src={user.avatar_url}/><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                    </Link>
                    <Button variant="outline" onClick={logout}>Sair</Button>
                  </>
                ) : <LoginDialog/>}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={()=>setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-yellow-600 via-green-700 to-blue-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Filmes.br</h2>
              <button onClick={()=>setSidebarOpen(false)} className="text-white hover:text-yellow-200"><X size={24}/></button>
            </div>
            <div className="py-4">
              <div className="px-4 pb-4 border-b border-white/20">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/profile" onClick={()=>setSidebarOpen(false)} className="flex items-center gap-3 hover:opacity-80">
                      <Avatar><AvatarImage src={user.avatar_url}/><AvatarFallback className="bg-white text-green-800">{user.name?.[0]}</AvatarFallback></Avatar>
                      <div><p className="text-white font-medium">{user.name}</p><p className="text-yellow-200 text-xs">Ver perfil</p></div>
                    </Link>
                    <button onClick={()=>{logout(); setSidebarOpen(false);}} className="text-yellow-200 text-sm ml-auto">Sair</button>
                  </div>
                ) : <LoginDialog/>}
              </div>
              <div className="mt-4 space-y-2">
                {items.map((it)=>(
                  <Link key={it.to} to={it.to} onClick={()=>setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 ${it.special ? "bg-blue-600/30" : ""}`}>
                    <it.icon size={20}/><span>{it.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
