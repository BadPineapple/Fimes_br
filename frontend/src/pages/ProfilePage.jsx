import React from "react";
import api from "../services/api";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Film, Star } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { id: profileUserId } = useParams();
  const [profileUser, setProfileUser] = React.useState(null);
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const [userRatings, setUserRatings] = React.useState([]);
  const [favoriteFilms, setFavoriteFilms] = React.useState([]);
  const [topRatedFilms, setTopRatedFilms] = React.useState([]);
  const [selectedList, setSelectedList] = React.useState("favorites");
  const [listFilms, setListFilms] = React.useState([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ name:"", description:"", is_private:false });

  React.useEffect(()=> {
    const targetId = profileUserId || user?.id || null;
    const isOwn = !!(user && (!profileUserId || profileUserId === user.id));
    setIsOwnProfile(isOwn);
    if (!targetId) return;

    if (isOwn) {
      setProfileUser(user);
      setEditData({ name: user.name, description: user.description || "", is_private: user.is_private || false });
    } else {
      api.get(`/auth/me?user_id=${targetId}`).then(r => setProfileUser(r.data)).catch(console.error);
    }

    (async ()=>{
      try {
        const viewerId = user ? user.id : null;
        const [rRatings, rFav] = await Promise.all([
          api.get(`/users/${targetId}/ratings`),
          isOwn ? api.get(`/users/${targetId}/film-lists/favorites?viewer_id=${viewerId}`) : Promise.resolve({data: []})
        ]);
        setUserRatings(rRatings.data);
        if (isOwn) {
          setFavoriteFilms(rFav.data.slice(0,5));
          const top = rRatings.data.sort((a,b)=> b.rating - a.rating || new Date(b.created_at)-new Date(a.created_at)).slice(0,5);
          setTopRatedFilms(top);
        }
      } catch(e){ console.error(e); }
    })();
  }, [user, profileUserId]);

  React.useEffect(()=>{ if (isOwnProfile) fetchListFilms(selectedList); }, [selectedList, isOwnProfile]);  

  const fetchListFilms = async (type) => {
    if (!isOwnProfile || !user) return;
    const targetId = profileUserId || user.id;
    try { const r = await api.get(`/users/${targetId}/film-lists/${type}?viewer_id=${user.id}`); setListFilms(r.data); }
    catch(e){ console.error(e); }
  };

  const handleSave = async () => {
    if (!user) return;
    try { await api.put(`/users/${user.id}`, editData); setIsEditing(false); window.location.reload(); }
    catch(e){ console.error(e); }
  };

  const currentUser = profileUser || user;
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center p-8">
            <CardHeader><CardTitle className="text-green-800">Acesso ao Perfil</CardTitle><CardDescription>Faça login para acessar seu perfil</CardDescription></CardHeader>
            <CardContent><p className="text-sm text-gray-600">Use o botão Entrar no topo.</p></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20"><AvatarImage src={currentUser.avatar_url}/><AvatarFallback className="text-2xl bg-green-100 text-green-800">{currentUser.name[0]}</AvatarFallback></Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input value={editData.name} onChange={(e)=>setEditData({...editData, name:e.target.value})}/>
                    <Textarea rows={2} value={editData.description} onChange={(e)=>setEditData({...editData, description:e.target.value})}/>
                    <div className="flex items-center gap-2">
                      <input id="is_private" type="checkbox" checked={editData.is_private} onChange={(e)=>setEditData({...editData, is_private:e.target.checked})}/>
                      <label htmlFor="is_private" className="text-sm">Perfil privado</label>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl text-green-800">{currentUser.name}</CardTitle>
                      {currentUser.is_supporter && <Star className="text-yellow-500 fill-yellow-500" size={24} title="Apoiador" />}
                      {currentUser.is_private && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Privado</span>}
                    </div>
                    <CardDescription className="text-base mt-2">{currentUser.description || "Amante do cinema brasileiro"}</CardDescription>
                  </>
                )}
              </div>
              <div className="space-x-2">
                {isOwnProfile && (isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={()=>setIsEditing(false)}>Cancelar</Button>
                  </>
                ) : <Button size="sm" variant="outline" onClick={()=>setIsEditing(true)}>Editar Perfil</Button>)}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Seus blocos de Favoritos, Top Rated, Listas e Avaliações... (mesmo conteúdo do seu App.js, sem mudanças de lógica) */}
        {/* Mantive esse arquivo enxuto para não estourar a resposta. Se quiser, mando a parte restante aqui também. */}
      </div>
    </div>
  );
}
