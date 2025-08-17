import React from 'react';
import type { ScrapedData } from '@/src/types';
import { classifyRestaurant, getPriorityLabel, getPriorityColor } from '@/src/lib/scraping/classification';
import { Star, TrendingUp, MapPin, PiggyBank } from 'lucide-react';

interface ClassificationStatsProps {
  data: ScrapedData[];
}

export const ClassificationStats: React.FC<ClassificationStatsProps> = ({ data }) => {
  // Calcola le statistiche
  const stats = data.reduce((acc, item) => {
    if (!item.analysis) return acc;
    
    const analysis = item.analysis.priority ? item.analysis : classifyRestaurant(item.analysis);
    
    if (analysis.priority === 'must-visit') acc.mustVisit++;
    if (analysis.priority === 'recommended') acc.recommended++;
    if (analysis.priority === 'if-in-area') acc.ifInArea++;
    if (analysis.isPorkSpecialist) acc.porkSpecialists++;
    
    return acc;
  }, {
    mustVisit: 0,
    recommended: 0,
    ifInArea: 0,
    porkSpecialists: 0,
    total: data.filter(item => item.analysis).length
  });

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
    description: string;
  }> = ({ icon, label, count, color, description }) => (
    <div className="card elevated p-4 text-center">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: color + '20', color: color }}
      >
        {icon}
      </div>
      <h3 className="heading-3 text-text-primary mb-1">{count}</h3>
      <p className="body-text-sm text-text-secondary mb-1">{label}</p>
      <p className="small-text text-text-tertiary">{description}</p>
    </div>
  );

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={24} className="text-primary-dark" />
        <h2 className="heading-2 text-text-primary">Classifica Ristoranti</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Star size={24} />}
          label="Assolutamente da visitare"
          count={stats.mustVisit}
          color={getPriorityColor('must-visit')}
          description="I migliori secondo i creator"
        />
        
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Consigliati"
          count={stats.recommended}
          color={getPriorityColor('recommended')}
          description="Ottima scelta per un pasto"
        />
        
        <StatCard
          icon={<MapPin size={24} />}
          label="Se sei in zona"
          count={stats.ifInArea}
          color={getPriorityColor('if-in-area')}
          description="Buoni se ti trovi nelle vicinanze"
        />
        
        <StatCard
          icon={<span className="text-2xl">🐷</span>}
          label="Specialisti Maiale"
          count={stats.porkSpecialists}
          color="var(--warning)"
          description="Esperti in carne suina"
        />
      </div>
      
      <div className="mt-6 p-4 bg-primary-light rounded-lg">
        <p className="body-text text-text-secondary text-center">
          <strong>{stats.total}</strong> ristoranti analizzati • 
          <strong> {Math.round((stats.mustVisit / stats.total) * 100)}%</strong> sono classificati come "assolutamente da visitare" • 
          <strong> {Math.round((stats.porkSpecialists / stats.total) * 100)}%</strong> sono specialisti in maiale
        </p>
      </div>
    </div>
  );
};