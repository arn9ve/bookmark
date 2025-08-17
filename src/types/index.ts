// Main data structure for a single scraped video
export interface ScrapedData {
  id: string;
  videoUrl: string;
  caption: string;
  analysis: RestaurantAnalysis | null;
  thumbnailUrl?: string;
  likes?: number;
  saves?: number;
  shares?: number;
  creatorName?: string;
  // Segna gli elementi appena aggiunti in questa sessione
  isNew?: boolean;
}

// Details for a single video, used internally in the scraping process
export interface VideoDetailsBase {
  platform: 'tiktok' | 'instagram' | 'unknown';
  audioUrl?: string;
  description?: string;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  error?: string;
  likes?: number;
  saves?: number;
  shares?: number;
}

// Response from the audio transcription module
export interface TranscribeAudioResponse {
  transcriptionText: string;
  error?: string;
}

// Result from the text analysis module
export interface AnalysisResult {
  isRestaurantReview: boolean;
  restaurantName?: string;
  dishDescription?: string;
  creatorOpinion?: string;
  restaurantLocation?: string;
  priority?: RestaurantPriority;
  isPorkSpecialist?: boolean;
  error?: string;
  // When multiple restaurants are mentioned in one video/description
  restaurants?: BasicRestaurantInfo[];
}

// Priority levels for restaurant recommendations
export type RestaurantPriority = 'must-visit' | 'recommended' | 'if-in-area';

// Structured analysis for restaurant reviews
export interface RestaurantAnalysis {
  restaurantName: string;
  dishDescription: string;
  creatorOpinion: string;
  restaurantLocation: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  priority?: RestaurantPriority;
  isPorkSpecialist?: boolean; // Indica se il ristorante fa principalmente maiale
}

// Basic restaurant info without geocoding fields, used during analysis
export type BasicRestaurantInfo = Omit<RestaurantAnalysis, 'latitude' | 'longitude' | 'formattedAddress'>;
