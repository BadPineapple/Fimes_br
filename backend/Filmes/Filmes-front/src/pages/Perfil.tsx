import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Film, Edit2, Camera, Star, List, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { filmesData } from "@/data/filmes";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? "Usuário");
  const [descricao, setDescricao] = useState("Amante do cinema brasileiro 🎬🇧🇷");

  // Mock data
  const filmesPreferidos = filmesData.slice(0, 4);
  const votacoesRecentes = [
    { filme: filmesData[0], nota: 9, data: "2026-02-28" },
    { filme: filmesData[3], nota: 10, data: "2026-02-25" },
    { filme: filmesData[1], nota: 8, data: "2026-02-20" },
  ];
  const listas = [
    { id: 1, nome: "Favoritos de Sempre", qtd: 12 },
    { id: 2, nome: "Para Assistir", qtd: 8 },
    { id: 3, nome: "Melhores Comédias", qtd: 5 },
  ];

  if (!user) {
    navigate("/entrar");
    return null;
  }

  const handleSave = () => {
    // Mock: api.put('/usuario/perfil', { nome, descricao })
    setEditing(false);
    toast.success("Perfil atualizado!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.info("Você saiu da sua conta");
  };

  const initials = nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero banner */}
      <div className="gradient-hero h-36 sm:h-48" />

      <div className="container mx-auto px-4 -mt-16 sm:-mt-20 pb-12">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-8">
          <div className="relative">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-background shadow-card">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl font-display bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-2 max-w-sm">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} />
                <Label>Descrição</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength={200}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{nome}</h1>
                <p className="text-muted-foreground mt-1">{descricao}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Filmes Avaliados", value: "27", icon: <Star className="w-5 h-5 text-secondary" /> },
            { label: "Listas Criadas", value: listas.length.toString(), icon: <List className="w-5 h-5 text-primary" /> },
            { label: "Horas Assistidas", value: "54h", icon: <Clock className="w-5 h-5 text-accent" /> },
          ].map((stat) => (
            <Card key={stat.label} className="text-center shadow-card">
              <CardContent className="pt-6 pb-4">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Filmes Preferidos */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Film className="w-5 h-5 text-secondary" />
                Filmes Preferidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {filmesPreferidos.map((filme) => (
                  <div
                    key={filme.id}
                    className="rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/filme/${filme.id}`)}
                  >
                    <div className="aspect-[2/3] bg-primary/10 flex items-center justify-center">
                      <Film className="w-8 h-8 text-primary/30" />
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium text-foreground truncate">{filme.titulo}</p>
                      <p className="text-xs text-muted-foreground">{filme.ano}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Votações Recentes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-secondary" />
                Votações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {votacoesRecentes.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/filme/${v.filme.id}`)}
                >
                  <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-primary/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.filme.titulo}</p>
                    <p className="text-xs text-muted-foreground">{v.data}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-sm">
                    {v.nota}/10
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Listas */}
          <Card className="shadow-card md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <List className="w-5 h-5 text-primary" />
                Minhas Listas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                {listas.map((lista) => (
                  <div
                    key={lista.id}
                    className="p-4 rounded-lg border border-border hover:shadow-md cursor-pointer transition-all hover:border-primary/30"
                  >
                    <p className="font-medium text-foreground">{lista.nome}</p>
                    <p className="text-sm text-muted-foreground">{lista.qtd} filmes</p>
                  </div>
                ))}
                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-all flex items-center justify-center text-muted-foreground hover:text-primary">
                  <span className="text-sm">+ Nova Lista</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Perfil;
