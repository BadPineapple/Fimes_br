import { Link } from "react-router-dom";
import { ArrowRight, Film, Star, Clapperboard } from "lucide-react";
import FilmCard from "@/components/FilmCard";
import { filmesData } from "@/data/filmes";

const Home = () => {
  const destaques = filmesData.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/50 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2 text-secondary">
              <Clapperboard className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Cinema Nacional</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
              Descubra o melhor do <span className="text-secondary">cinema brasileiro</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Explore nossa curadoria especial do cinema nacional. De clássicos atemporais a obras contemporâneas que estão transformando a filmografia brasileira.
            </p>
            <Link
              to="/filmes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Explorar Filmes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <Film className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-display font-bold text-foreground">{filmesData.length}+</div>
              <div className="text-sm text-muted-foreground">Filmes</div>
            </div>
            <div>
              <Star className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-display font-bold text-foreground">8.0</div>
              <div className="text-sm text-muted-foreground">Nota Média</div>
            </div>
            <div>
              <Clapperboard className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-display font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground">Diretores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Filmes em Destaque
              </h2>
              <p className="text-muted-foreground mt-2">Os melhores do cinema nacional</p>
            </div>
            <Link
              to="/filmes"
              className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {destaques.map((filme, i) => (
              <div key={filme.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <FilmCard filme={filme} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/filmes"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos os filmes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
