import React from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Film, Star, MessageSquare } from "lucide-react";

const s = (v) => String(v);

export default function FilmDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [film, setFilm] = React.useState(null);
  const [ratings, setRatings] = React.useState([]);
  const [avg, setAvg] = React.useState({ average:0, count:0 });
  const [userRating, setUserRating] = React.useState({ rating:0, comment:"" });
  const [lists, setLists] = React.useState({ favorites:false, watched:false, to_watch:false });
  const [loading, setLoading] = React.useState(true);

  const load = async ()=>{
    try {
      const [f, r, a] = await Promise.all([
        api.get(`/films/${id}`),
        api.get(`/films/${id}/ratings`),
        api.get(`/films/${id}/average-rating`)
      ]);
      setFilm(f.data); setRatings(r.data); setAvg(a.data);

      if (user) {
        const ex = r.data.find(x=>x.user_id === user.id);
        if (ex) setUserRating({ rating: ex.rating, comment: ex.comment || "" });

        const [fav, wat, tw] = await Promise.all([
          api.get(`/users/${user.id}/film-lists/favorites?viewer_id=${user.id}`),
          api.get(`/users/${user.id}/film-lists/watched?viewer_id=${user.id}`),
          api.get(`/users/${user.id}/film-lists/to_watch?viewer_id=${user.id}`)
        ]);
        setLists({
          favorites: fav.data.some(f=> s(f.id) === s(id)),
          watched:   wat.data.some(f=> s(f.id) === s(id)),
          to_watch:  tw.data.some(f=> s(f.id) === s(id)),
        });
      }
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  React.useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [id]);

  const submitRating = async ()=>{
    if (!user || userRating.rating===0) return;
    try {
      await api.post(`/films/${id}/ratings?user_id=${user.id}`, { film_id: s(id), rating: userRating.rating, comment: userRating.comment });
      load();
    } catch(e){ console.error(e); alert("Erro ao enviar avaliação"); }
  };

  const report = async (commentId)=>{
    if (!user) return;
    const reason = prompt("Motivo (spam, inappropriate, harassment, off_topic, other):");
    if (!reason) return;
    const description = prompt("Descrição (opcional):") || undefined;
    try { await api.post(`/comments/report?user_id=${user.id}`, { comment_id: commentId, reason, description }); alert("Denúncia enviada!"); }
    catch(e){ console.error(e); alert("Erro ao enviar denúncia"); }
  };

  const toggle = async (type)=>{
    if (!user) return alert("Faça login para usar as listas");
    try {
      if (lists[type]) await api.delete(`/users/${user.id}/film-lists/${id}/${type}`);
      else await api.post(`/users/${user.id}/film-lists`, { film_id: s(id), list_type: type });
      setLists({ ...lists, [type]: !lists[type] });
    } catch(e){ console.error(e); alert("Erro ao atualizar lista"); }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50"><div className="flex items-center justify-center h-64"><div className="text-2xl text-green-800">Carregando filme...</div></div></div>;
  if (!film) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center p-8"><CardContent>
          <Film size={64} className="mx-auto mb-4 text-green-600"/><h2 className="text-2xl font-bold text-green-800 mb-2">Filme não encontrado</h2>
          <p className="text-green-700 mb-4">O filme não existe ou foi removido.</p><Link to="/films"><Button>Voltar aos Filmes</Button></Link>
        </CardContent></Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cabeçalho do filme (igual ao seu) */}
        {/* ... Para caber na resposta, omiti alguns trechos visuais. A lógica principal acima está completa. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {user && (
            <Card><CardHeader><CardTitle className="text-green-800">Sua Avaliação</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nota (1-5):</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n=>(
                      <Star key={n} size={24} className={`cursor-pointer ${n<=userRating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"}`} onClick={()=>setUserRating({...userRating, rating:n})}/>
                    ))}
                  </div>
                </div>
                <Textarea rows={3} value={userRating.comment} onChange={(e)=>setUserRating({...userRating, comment:e.target.value})} placeholder="O que você achou?" />
                <Button className="w-full bg-green-600 hover:bg-green-700" disabled={userRating.rating===0} onClick={submitRating}>Salvar Avaliação</Button>
              </CardContent>
            </Card>
          )}

          <Card><CardHeader><CardTitle className="text-green-800">Avaliações da Comunidade ({ratings.length})</CardTitle></CardHeader>
            <CardContent>
              {ratings.length ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {ratings.map(r=>(
                    <div key={r.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarImage src={r.user_avatar}/><AvatarFallback>{r.user_name[0]}</AvatarFallback></Avatar>
                          <span className="font-medium">{r.user_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[...Array(5)].map((_,i)=><Star key={i} size={14} className={`${i<r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}/>)}
                          </div>
                          {user && user.id !== r.user_id && (
                            <button onClick={()=>report(r.id)} className="text-gray-400 hover:text-red-500 text-xs" title="Denunciar comentário">⚠️</button>
                          )}
                        </div>
                      </div>
                      {r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500"><MessageSquare size={48} className="mx-auto mb-4"/><p>Ainda não há avaliações.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
