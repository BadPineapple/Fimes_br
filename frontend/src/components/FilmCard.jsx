import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Film, Star } from "lucide-react";

export default function FilmCard({ film }) {
  return (
    <Link to={`/films/${film.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" data-testid={`film-card-${film.id}`}>
        <div className="aspect-[2/3] bg-gradient-to-br from-green-200 to-yellow-200 relative">
          {film.banner_url ? <img src={film.banner_url} alt={film.title} className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center"><Film size={48} className="text-green-600" /></div>}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2" data-testid="film-title">{film.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {film.year && <span>{film.year}</span>}
            {film.imdb_rating && (
              <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /><span>{film.imdb_rating}</span></div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {(film.tags || []).slice(0,2).map((tag,i)=>(
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
