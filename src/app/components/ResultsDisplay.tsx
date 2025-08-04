import type { ScrapedData } from "@/src/types";
import ResultCard from "./ResultCard";

interface ResultsDisplayProps {
  data: ScrapedData[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function ResultsDisplay({ data, favorites, onToggleFavorite }: ResultsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) => (
        <ResultCard 
          key={item.id} 
          item={item} 
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
