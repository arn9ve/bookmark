import { NextResponse } from 'next/server';
import { scrapeProfile } from '@/src/lib/scraping/profile';
import { getVideoInfo } from '@/src/lib/scraping/video';
import { transcribeAudio } from '@/src/lib/scraping/audio';
import { analyzeText } from '@/src/lib/scraping/analysis';
import { geocodeRestaurant } from '@/src/lib/scraping/location'; // Importa la nuova funzione
import type { ScrapedData, RestaurantAnalysis } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 300; // 5 minuti

export async function POST(request: Request) {
  const { url, limit, keywords } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`[API Scrape] Inizio scraping per il profilo: ${url} con limite ${limit} e keywords "${keywords}"`);

  const profileResult = await scrapeProfile(url, limit);

  if (profileResult.error || !profileResult.videoUrls) {
    return NextResponse.json({ error: profileResult.error || 'Could not get video URLs' }, { status: 500 });
  }

  console.log(`[API Scrape] Trovati ${profileResult.videoUrls.length} video. Inizio analisi individuale...`);

  const analysisPromises = profileResult.videoUrls.map(async (videoUrl) => {
    try {
      // 1. Get video info
      const videoInfo = await getVideoInfo(videoUrl);
      if (videoInfo.error) {
        console.error(`Errore getVideoInfo per ${videoUrl}: ${videoInfo.error}`);
        return null;
      }

      // 2. Filter by keywords
      if (keywords && keywords.trim() !== '') {
        const lowerCaseKeywords = keywords.toLowerCase();
        const lowerCaseDescription = (videoInfo.description || '').toLowerCase();
        if (!lowerCaseDescription.includes(lowerCaseKeywords)) {
          console.log(`[Keyword Filter] Il video ${videoUrl} scartato perché non contiene "${keywords}".`);
          return null;
        }
      }

      // 3. Transcribe audio
      const transcriptionResult = await transcribeAudio(videoInfo);
      if (transcriptionResult.error) {
        console.warn(`Errore trascrizione per ${videoUrl}: ${transcriptionResult.error}. L'analisi procederà con la sola descrizione.`);
      }
      const fullText = transcriptionResult.transcriptionText || videoInfo.description || '';

      // 4. Analyze text
      const analysisResult = await analyzeText(fullText);
      if (analysisResult.error || !analysisResult.isRestaurantReview || !analysisResult.restaurantName || !analysisResult.restaurantLocation) {
        if(analysisResult.error) console.error(`Errore analisi per ${videoUrl}: ${analysisResult.error}`);
        else console.log(`Il video ${videoUrl} non è una recensione di ristorante valida o mancano dati essenziali.`);
        return null;
      }
      
      // 5. Geocode restaurant location
      const geocodeResult = await geocodeRestaurant(
        analysisResult.restaurantName,
        analysisResult.restaurantLocation
      );
      if (geocodeResult.error) {
        console.warn(`[Geocoding] Non è stato possibile geolocalizzare "${analysisResult.restaurantName}, ${analysisResult.restaurantLocation}". Errore: ${geocodeResult.error}`);
      }

      const restaurantAnalysis: RestaurantAnalysis = {
        restaurantName: analysisResult.restaurantName,
        dishDescription: analysisResult.dishDescription || 'N/A',
        creatorOpinion: analysisResult.creatorOpinion || 'N/A',
        restaurantLocation: analysisResult.restaurantLocation,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        formattedAddress: geocodeResult.formattedAddress,
      };

      const scrapedData: ScrapedData = {
        id: uuidv4(),
        videoUrl: videoUrl,
        caption: videoInfo.description || '',
        analysis: restaurantAnalysis,
        thumbnailUrl: videoInfo.thumbnailUrl,
        likes: videoInfo.likes,
        shares: videoInfo.shares,
        saves: videoInfo.saves,
        creatorName: videoInfo.author,
      };
      
      return scrapedData;

    } catch (e) {
      console.error(`Errore grave durante l'analisi del video ${videoUrl}:`, e);
      return null;
    }
  });

  const results = (await Promise.all(analysisPromises)).filter((r): r is ScrapedData => r !== null);

  console.log(`[API Scrape] Analisi completata. Restituiti ${results.length} risultati validi.`);

  return NextResponse.json(results);
}
