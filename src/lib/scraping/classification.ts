import type { RestaurantAnalysis, RestaurantPriority } from '../../types';

// Parole chiave per identificare ristoranti specializzati in maiale
const PORK_KEYWORDS = [
  'maiale', 'pork', 'porchetta', 'guanciale', 'pancetta', 'bacon', 
  'salsiccia', 'braciole', 'costoletta', 'lonza', 'spalla', 'coppa',
  'mortadella', 'prosciutto', 'salami', 'nduja', 'ventricina',
  'suino', 'pig', 'ham', 'sausage', 'pork belly', 'ribs',
  'pulled pork', 'carnitas', 'chorizo', 'jamón', 'lardo'
];

// Parole chiave per alta priorità (must-visit)
const HIGH_PRIORITY_KEYWORDS = [
  'incredibile', 'straordinario', 'eccezionale', 'perfetto', 'fantastico',
  'sublime', 'divino', 'spettacolare', 'meraviglioso', 'stupendo',
  'amazing', 'incredible', 'outstanding', 'perfect', 'fantastic',
  'sublime', 'divine', 'spectacular', 'wonderful', 'stunning',
  'da non perdere', 'assolutamente', 'top', 'migliore', 'unico',
  'legendary', 'iconic', 'best', 'unique', 'must try'
];

// Parole chiave per media priorità (recommended)
const MEDIUM_PRIORITY_KEYWORDS = [
  'buono', 'ottimo', 'carino', 'piacevole', 'interessante',
  'good', 'great', 'nice', 'pleasant', 'interesting',
  'consiglio', 'vale la pena', 'recommend', 'worth',
  'solido', 'decent', 'solid', 'worthwhile'
];

// Parole chiave per bassa priorità (if-in-area)
const LOW_PRIORITY_KEYWORDS = [
  'normale', 'okay', 'così così', 'niente di che', 'passabile',
  'average', 'ok', 'so-so', 'nothing special', 'decent enough',
  'meh', 'fine', 'acceptable', 'not bad'
];

// Parole negative che riducono la priorità
const NEGATIVE_KEYWORDS = [
  'male', 'cattivo', 'terribile', 'orribile', 'deludente',
  'bad', 'terrible', 'awful', 'horrible', 'disappointing',
  'expensive', 'caro', 'troppo caro', 'overpriced', 'scadente'
];

/**
 * Classifica un ristorante basandosi sull'analisi del creator e la descrizione del piatto
 */
export function classifyRestaurant(analysis: RestaurantAnalysis): RestaurantAnalysis {
  const { creatorOpinion, dishDescription, restaurantName } = analysis;
  
  // Combina tutti i testi per l'analisi
  const fullText = `${creatorOpinion} ${dishDescription} ${restaurantName}`.toLowerCase();
  
  // Rileva se è specializzato in maiale
  const isPorkSpecialist = detectPorkSpecialist(fullText);
  
  // Calcola la priorità
  const priority = calculatePriority(fullText);
  
  return {
    ...analysis,
    priority,
    isPorkSpecialist
  };
}

/**
 * Rileva se il ristorante è specializzato in maiale
 */
function detectPorkSpecialist(text: string): boolean {
  const porkMentions = PORK_KEYWORDS.filter(keyword => 
    text.includes(keyword.toLowerCase())
  ).length;
  
  // Se ha almeno 2 menzioni di parole relative al maiale, lo consideriamo specialista
  return porkMentions >= 2;
}

/**
 * Calcola la priorità del ristorante basandosi sui sentiment keywords
 */
function calculatePriority(text: string): RestaurantPriority {
  let score = 0;
  
  // Aggiungi punti per parole positive
  HIGH_PRIORITY_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 3;
    }
  });
  
  MEDIUM_PRIORITY_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 2;
    }
  });
  
  LOW_PRIORITY_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
    }
  });
  
  // Sottrai punti per parole negative
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score -= 2;
    }
  });
  
  // Determina la priorità finale
  if (score >= 5) {
    return 'must-visit';
  } else if (score >= 2) {
    return 'recommended';
  } else {
    return 'if-in-area';
  }
}

/**
 * Ottieni il label umano per la priorità
 */
export function getPriorityLabel(priority: RestaurantPriority): string {
  switch (priority) {
    case 'must-visit':
      return 'Assolutamente da visitare';
    case 'recommended':
      return 'Consigliato';
    case 'if-in-area':
      return 'Se sei in zona';
    default:
      return 'Non classificato';
  }
}

/**
 * Ottieni il colore per la priorità (per badge e marker)
 */
export function getPriorityColor(priority: RestaurantPriority): string {
  switch (priority) {
    case 'must-visit':
      return 'var(--accent-1)'; // Yellow accent for must-visit
    case 'recommended':
      return 'var(--primary)'; // Blue for recommended
    case 'if-in-area':
      return 'var(--surface-secondary)'; // Yellow wash for low importance
    default:
      return 'var(--text-tertiary)';
  }
}

/**
 * Ordina i ristoranti per priorità
 */
export function sortByPriority(restaurants: RestaurantAnalysis[]): RestaurantAnalysis[] {
  const priorityOrder: Record<RestaurantPriority, number> = {
    'must-visit': 3,
    'recommended': 2,
    'if-in-area': 1
  };
  
  return restaurants.sort((a, b) => {
    const aPriority = a.priority ? priorityOrder[a.priority] : 0;
    const bPriority = b.priority ? priorityOrder[b.priority] : 0;
    
    // Prima ordina per priorità, poi per specialista maiale
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // A parità di priorità, metti prima i specialisti di maiale
    if (a.isPorkSpecialist && !b.isPorkSpecialist) return -1;
    if (!a.isPorkSpecialist && b.isPorkSpecialist) return 1;
    
    return 0;
  });
}