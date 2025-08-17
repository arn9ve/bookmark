import React, { useState } from 'react';
import { getPriorityLabel, getPriorityColor } from '@/src/lib/scraping/classification';
import type { RestaurantPriority } from '@/src/types';
import { Star, Check, Dot } from 'lucide-react';

interface LegendItemProps {
  priority: RestaurantPriority;
  isPorkSpecialist?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ priority, isPorkSpecialist = false }) => {
  const color = getPriorityColor(priority);
  const label = getPriorityLabel(priority);
  
  const getIcon = () => {
    switch (priority) {
      case 'must-visit':
        return <Star size={18} />;
      case 'recommended':
        return <Check size={18} />;
      case 'if-in-area':
        return <Dot size={18} />;
      default:
        return <Dot size={18} />;
    }
  };

  const isBlue = priority === 'recommended';
  const bubbleStyle: React.CSSProperties = {
    backgroundColor: color,
    color: isBlue ? 'var(--surface)' : 'var(--text-primary)',
    border: '2px solid var(--border-dark)'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
        style={bubbleStyle}
      >
        {getIcon()}
      </div>
      <span className="body-text-xs text-text-secondary text-center">
        {label}
        {isPorkSpecialist && ' + 🐷 Maiale'}
      </span>
    </div>
  );
};

export const MapLegend: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`absolute left-1/2 max-w-[40%] -translate-x-1/2 bottom-4 z-10 w-[min(900px,calc(100%-16px))] transition-transform duration-300 ${
        expanded ? 'translate-y-0' : 'translate-y-[calc(100%-26px)]'
      }`}
    >
      <div className="bg-surface border border-border shadow-md rounded-t-lg rounded-b-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <h3 className="heading-5 text-text-primary">Legenda Marker</h3>
          <button
            type="button"
            aria-label={expanded ? 'Nascondi legenda' : 'Mostra legenda'}
            onClick={() => setExpanded((v) => !v)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            {expanded ? '▼' : '▲'}
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <LegendItem priority="must-visit" />
            <LegendItem priority="recommended" />
            <LegendItem priority="if-in-area" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center text-sm">🐷</div>
              <span className="body-text-xs text-text-secondary text-center">Maiale</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};