import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

export function Carousel({ titulo, filmes }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8 group">
      <div className="flex justify-between items-end mb-6 px-12">
        <h3 className="text-2xl font-bold text-green-900">{titulo}</h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => scroll('left')} className="p-2 bg-white rounded-full shadow-md hover:bg-green-50">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className="p-2 bg-white rounded-full shadow-md hover:bg-green-50">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-12 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filmes.map(filme => (
          <div key={filme.id} className="min-w-[250px]">
            <MovieCard filme={filme} />
          </div>
        ))}
      </div>
    </div>
  );
}