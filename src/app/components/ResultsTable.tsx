import type { ScrapedData } from "@/src/types";
import { Heart, MapPin, Video } from 'lucide-react';

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
                  <a 
                    href={generateMapsUrl(item)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-circle btn-sm btn-primary hover:scale-110 transition-transform"
                    title="Apri su Maps"
                  >
                    <MapPin size={16} />
                  </a>
                  
                  {/* Salva - Priorità 2 */}
                  <button 
                    className={`btn btn-circle btn-sm hover:scale-110 transition-transform ${
                      favorites.includes(item.id) ? 'btn-error' : 'btn-outline btn-error'
                    }`}
                    onClick={() => onToggleFavorite(item.id)}
                    title={favorites.includes(item.id) ? 'Rimuovi dai salvati' : 'Salva'}
                  >
                    <Heart size={16} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                  </button>
                  
                  {/* Video - Priorità 3 (terziario) */}
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-circle btn-sm btn-outline btn-secondary hover:scale-110 transition-transform opacity-75"
                    title="Guarda il Video"
                  >
                    <Video size={16} />
                  </a>
                </div>
              </td>
              <td className="font-semibold">{item.analysis?.restaurantName}</td>
              <td className="text-sm">{item.analysis?.dishDescription}</td>
              <td className="text-sm text-gray-600">{item.analysis?.formattedAddress || item.analysis?.restaurantLocation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}