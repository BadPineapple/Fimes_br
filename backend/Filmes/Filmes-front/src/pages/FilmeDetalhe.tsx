import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Film as FilmIcon, MessageSquare, ExternalLink } from "lucide-react";
import { filmesData } from "@/data/filmes";
import GenreBadge from "@/components/GenreBadge";
import StarRating from "@/components/StarRating";
import { useState } from "react";

const FilmeDetalhe = () => {
  const { id } = useParams();
  const filme = filmesData.find((f) => f.id === Number(id));
  const [userRating, setUserRating] = useState(0);
  const [comentario, setComentario] = useState("");

  if (!filme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Filme não encontrado</p>
          <Link to="/filmes" className="text-primary hover:underline">Voltar para filmes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link
          to="/filmes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para filmes
        </Link>

        {/* Film details */}
        <div className="grid md:grid-cols-[350px_1fr] gap-8 mb-12">
          {/* Poster */}
          <div className="aspect-[2/3] rounded-xl overflow-hidden gradient-card flex items-center justify-center shadow-card">
            {filme.imagem_capa ? (
              <img src={filme.imagem_capa} alt={filme.titulo} className="w-full h-full object-cover" />
            ) : (
              <FilmIcon className="w-20 h-20 text-primary/25" />
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                <span className="text-lg font-semibold text-foreground">{filme.ano}</span>
                {filme.diretor && (
                  <>
                    <span>·</span>
                    <span>Direção: {filme.diretor}</span>
                  </>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {filme.titulo}
              </h1>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">IMDB:</span>
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span className="font-medium">{filme.nota}/10</span>
              </div>
              {filme.nota_letterboxd && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">Letterboxd:</span>
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-medium">{filme.nota_letterboxd}/5</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {filme.genero.map((g) => (
                <GenreBadge key={g} genre={g} />
              ))}
            </div>

            {/* Synopsis */}
            {filme.sinopse && (
              <div>
                <h2 className="font-display text-xl font-semibold text-primary mb-2">Sinopse</h2>
                <p className="text-foreground/80 leading-relaxed">{filme.sinopse}</p>
              </div>
            )}

            {/* Where to watch */}
            {filme.onde_assistir && filme.onde_assistir.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Onde Assistir</h2>
                <div className="flex flex-wrap gap-2">
                  {filme.onde_assistir.map((plat) => (
                    <span
                      key={plat}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {plat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User review */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-primary mb-4">Sua Avaliação</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nota (1-5 estrelas):
                </label>
                <StarRating rating={userRating} max={5} size="md" interactive onChange={setUserRating} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Comentário (opcional):
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="O que você achou do filme?"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-28"
                />
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Salvar Avaliação
              </button>
            </div>
          </div>

          {/* Community reviews */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-primary mb-4">
              Avaliações da Comunidade (0)
            </h3>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p>Ainda não há avaliações para este filme</p>
              <p className="text-sm mt-1">Seja o primeiro a avaliar!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmeDetalhe;
