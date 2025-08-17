import type { ScrapedData } from "@/src/types";
import { MapPin, Star, Utensils, Video, Heart, User } from 'lucide-react';
import { classifyRestaurant, getPriorityLabel, getPriorityColor } from "@/src/lib/scraping/classification";
import Button from "@/src/app/_components/ui/Button";

interface ResultCardProps {
  item: ScrapedData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ResultCard({ item, isFavorite, onToggleFavorite }: ResultCardProps) {
  if (!item.analysis) {
    return null;
  }

  // Applica la classificazione se non è già presente
  const analysis = item.analysis.priority ? item.analysis : classifyRestaurant(item.analysis);

  const { 
    restaurantName, 
    dishDescription, 
    creatorOpinion, 
    restaurantLocation,
    latitude,
    longitude,
    formattedAddress,
    priority,
    isPorkSpecialist
  } = analysis;

  const generateMapsUrl = () => {
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

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }



  return (
    <div className="card interactive overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-0">
        {/* Image Section */}
        {item.thumbnailUrl && (
          <div className="lg:w-80 h-49 lg:h-auto relative overflow-hidden bg-surface-secondary">
            <img 
              src={item.thumbnailUrl} 
              alt={`Thumbnail for ${restaurantName}`} 
              className="w-full h-full object-cover transition-transform duration-300" 
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {item.isNew && (
                <span className="text-[10px] uppercase tracking-wide bg-success text-white px-2 py-0.5 rounded-full shadow-sm">Nuovo</span>
              )}
              <Button size="sm" className={` w-8 h-8 ${isFavorite ? 'is-active btn-fav' : 'btn-fav'}`} onClick={() => onToggleFavorite(item.id)} title={isFavorite ? 'Rimuovi dai salvati' : 'Salva'}>
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
        )}
        
        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <h2 className="heading-2 text-text-primary line-clamp-2 flex-1">
                  {restaurantName}
                </h2>
                
                {/* Badge priorità e maiale */}
                <div className="flex flex-col gap-1 ml-3 flex-shrink-0">
                  {priority && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: getPriorityColor(priority) }}
                    >
                      {priority === 'must-visit' ? '⭐' : priority === 'recommended' ? '👍' : '📍'}
                    </span>
                  )}
                  
                  {isPorkSpecialist && (
                    <span className="text-xs bg-warning text-white px-2 py-1 rounded-full text-center">
                      🐷
                    </span>
                  )}
                </div>
              </div>
              
              {/* Priority label */}
              {priority && (
                <div className="mb-3">
                  <span className="small-text text-text-tertiary">
                    {getPriorityLabel(priority)}
                    {isPorkSpecialist && ' • Specialista Maiale'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-text-tertiary">
                  <MapPin size={16} className="text-primary-dark flex-shrink-0" />
                  <span className="body-text-sm truncate">{formattedAddress || restaurantLocation}</span>
                </div>
                
                {item.creatorName && (
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <User size={16} className="text-primary-dark flex-shrink-0" />
                    <span className="body-text-sm">{item.creatorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Utensils size={16} className="text-primary-dark" />
                  <h3 className="heading-4 text-text-primary">Piatto</h3>
                </div>
                <p className="body-text text-text-secondary line-clamp-2">{dishDescription}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-primary-dark" />
                  <h3 className="heading-4 text-text-primary">Parere del Creator</h3>
                </div>
                <p className="body-text text-text-secondary italic line-clamp-3">"{creatorOpinion}"</p>
              </div>

              {/* Engagement Stats */}
              {(item.likes || item.saves || item.shares) && (
                <div className="flex gap-4 pt-2 border-t border-border">
                  {item.likes && (
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Heart size={14} />
                      <span className="small-text">{formatNumber(item.likes)}</span>
                    </div>
                  )}
                  {item.saves && (
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Star size={14} />
                      <span className="small-text">{formatNumber(item.saves)}</span>
                    </div>
                  )}
                  {item.shares && (
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Video size={14} />
                      <span className="small-text">{formatNumber(item.shares)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border w-full">
              {/* Maps - Primary Action */}
              <a 
                href={generateMapsUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary hover-lift flex-1"
                title="Apri su Maps"
              >
                <MapPin size={18} />
      
              </a>
              
              {/* Video - Secondary Action */}
              <a 
                href={item.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary hover-lift flex-1"
                title="Guarda il Video"
              >
                <Video size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
