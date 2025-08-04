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
  error?: string;
}

// Structured analysis for restaurant reviews
export interface RestaurantAnalysis {
  restaurantName: string;
  dishDescription: string;
  creatorOpinion: string;
  restaurantLocation: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}
