import type { ScrapedData } from "@/src/types";
import { Heart, MapPin, Video } from 'lucide-react';
import Button from "@/src/app/_components/ui/Button";

interface ResultsTableProps {
  data: ScrapedData[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function ResultsTable({ data, favorites, onToggleFavorite }: ResultsTableProps) {
    
    const formatNumber = (num: number | undefined) => {
        if (num === undefined) return 'N/A';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }

  const generateMapsUrl = (item: ScrapedData) => {
    const { latitude, longitude, formattedAddress, restaurantName, restaurantLocation } = item.analysis || {};
    let query;
    if (latitude && longitude) {
      query = `${latitude},${longitude}`;
    } else if (formattedAddress) {
      query = formattedAddress;
    } else {
      query = `${restaurantName}, ${restaurantLocation}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
      <table className="table w-full">
        <thead className="bg-base-200">
          <tr>
            <th className="text-center">Azioni</th>
            <th>Ristorante</th>
            <th>Piatto</th>
            <th>Posizione</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className={`hover:bg-base-50 ${index % 2 === 0 ? 'bg-base-25' : ''}`}>
              <td className="text-center">
                <div className="flex justify-center gap-2">
                  {/* Maps - Priorità 1 */}
                  <Button href={generateMapsUrl(item)} size="sm" className="btn btn-circle btn-sm btn-primary hover:scale-110 transition-transform" title="Apri su Maps">
                    <MapPin size={16} />
                  </Button>
                  
                  {/* Salva - Priorità 2 */}
                  <button 
                    className={`btn-icon-button btn-sm btn-fav ${favorites.includes(item.id) ? 'is-active' : ''}`}
                    onClick={() => onToggleFavorite(item.id)}
                    title={favorites.includes(item.id) ? 'Rimuovi dai salvati' : 'Salva'}
                  >
                    <Heart size={16} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                  </button>
                  
                  {/* Video - Priorità 3 (terziario) */}
                  <Button href={item.videoUrl} size="sm" className="btn btn-secondary btn-sm" title="Guarda il Video">
                    <Video size={16} />
                  </Button>
                </div>
              </td>
              <td className="font-semibold">
                <div className="flex items-center gap-2">
                  <span>{item.analysis?.restaurantName}</span>
                  {item.isNew && (
                    <span className="text-[10px] uppercase tracking-wide bg-success text-white px-2 py-0.5 rounded-full">Nuovo</span>
                  )}
                </div>
              </td>
              <td className="text-sm">{item.analysis?.dishDescription}</td>
              <td className="text-sm text-gray-600">{item.analysis?.formattedAddress || item.analysis?.restaurantLocation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}