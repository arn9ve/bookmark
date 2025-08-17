import type { ScrapedData } from "@/src/types";
import ResultCard from "./ResultCard";
import { classifyRestaurant } from "@/src/lib/scraping/classification";

interface ResultsDisplayProps {
  data: ScrapedData[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function ResultsDisplay({ data, favorites, onToggleFavorite }: ResultsDisplayProps) {
  // Ordina i dati per priorità: prima "must-visit", poi "recommended", infine "if-in-area"
  const sortedData = [...data].sort((a, b) => {
    if (!a.analysis || !b.analysis) return 0;
    
    // Applica la classificazione se non è già presente
    const analysisA = a.analysis.priority ? a.analysis : classifyRestaurant(a.analysis);
    const analysisB = b.analysis.priority ? b.analysis : classifyRestaurant(b.analysis);
    
    const priorityOrder = { 'must-visit': 3, 'recommended': 2, 'if-in-area': 1 };
    const priorityA = analysisA.priority ? priorityOrder[analysisA.priority] : 0;
    const priorityB = analysisB.priority ? priorityOrder[analysisB.priority] : 0;
    
    // Prima ordina per priorità
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // A parità di priorità, metti prima i specialisti di maiale
    if (analysisA.isPorkSpecialist && !analysisB.isPorkSpecialist) return -1;
    if (!analysisA.isPorkSpecialist && analysisB.isPorkSpecialist) return 1;
    
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedData.map((item) => (
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
