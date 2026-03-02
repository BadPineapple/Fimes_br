import { Heart, Coffee, Star } from "lucide-react";

const Apoio = () => {
  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <Heart className="w-10 h-10 mx-auto mb-4 text-destructive" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Apoie o Cinema Brasileiro
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            O Filmes.br é um projeto independente dedicado a catalogar e celebrar o cinema nacional. 
            Sua contribuição nos ajuda a manter o site no ar e adicionar mais filmes ao catálogo.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tier 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <Coffee className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Me pague um café</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  R$ 5,00 — Ajuda a manter o servidor rodando por mais um dia.
                </p>
              </div>
              <button className="px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Apoiar
              </button>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="rounded-xl border-2 border-secondary bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow relative">
            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
              Popular
            </span>
            <div className="flex items-start gap-4">
              <Star className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Apoiador Mensal</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  R$ 15,00/mês — Acesso a conteúdo exclusivo e badge especial no perfil.
                </p>
              </div>
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Assinar
              </button>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Patrono do Cinema</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  R$ 50,00/mês — Tudo do plano anterior + seu nome nos créditos do site.
                </p>
              </div>
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Assinar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Toda contribuição faz diferença. Obrigado por apoiar o cinema brasileiro! 🇧🇷
          </p>
        </div>
      </div>
    </div>
  );
};

export default Apoio;
