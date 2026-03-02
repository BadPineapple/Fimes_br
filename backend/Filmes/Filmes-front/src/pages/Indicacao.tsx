import { useState } from "react";
import { Sparkles, Send, Film as FilmIcon } from "lucide-react";
import FilmCard from "@/components/FilmCard";
import { filmesData } from "@/data/filmes";
import type { Filme } from "@/data/filmes";

const Indicacao = () => {
  const [pergunta, setPergunta] = useState("");
  const [resultado, setResultado] = useState<Filme | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIndicar = () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    // Mock AI - random selection based on input
    setTimeout(() => {
      const random = filmesData[Math.floor(Math.random() * filmesData.length)];
      setResultado(random);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-secondary mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Indicação Inteligente</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Qual filme brasileiro você quer assistir?
          </h1>
          <p className="text-muted-foreground">
            Descreva o que você está procurando e nossa IA vai indicar o filme perfeito pra você.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-8">
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Ex: Quero um filme de ação no sertão nordestino, ou um drama sobre a vida na favela..."
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-32 mb-4"
          />
          <button
            onClick={handleIndicar}
            disabled={loading || !pergunta.trim()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Procurando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Pedir Indicação
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {resultado && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FilmIcon className="w-5 h-5 text-primary" />
              Nossa indicação pra você:
            </h2>
            <div className="max-w-[200px] mx-auto">
              <FilmCard filme={resultado} />
            </div>
            {resultado.sinopse && (
              <p className="text-center text-muted-foreground mt-4 text-sm max-w-md mx-auto">
                {resultado.sinopse}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Indicacao;
