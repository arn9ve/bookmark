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

  // Rileva se è un URL di singolo video (TikTok/Instagram) piuttosto che di profilo
  const isSingleVideoUrl = /tiktok\.com\/.+\/video\//i.test(url) || /instagram\.com\/reel\//i.test(url);

  const videoUrls: string[] = [];
  if (isSingleVideoUrl) {
    console.log(`[API Scrape] Modalità singolo video rilevata: ${url}`);
    videoUrls.push(url);
  } else {
    console.log(`[API Scrape] Inizio scraping per il profilo: ${url} con limite ${limit} e keywords "${keywords}"`);
    const profileResult = await scrapeProfile(url, limit);
    if (profileResult.error || !profileResult.videoUrls) {
      return NextResponse.json({ error: profileResult.error || 'Could not get video URLs' }, { status: 500 });
    }
    videoUrls.push(...profileResult.videoUrls);
  }

  console.log(`[API Scrape] Trovati ${videoUrls.length} video. Inizio analisi individuale...`);

  const analysisPromises = videoUrls.map(async (videoUrl) => {
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
      const captionText = videoInfo.description || '';
      const transcriptText = transcriptionResult.transcriptionText || '';
      const fullText = [captionText, transcriptText].filter(Boolean).join('\n');

      // 4. Analyze text (caption + transcript)
      let analysisResult = await analyzeText(fullText);
      // Fallback: se non rileva recensione, prova ad analizzare SOLO la didascalia, che spesso elenca i ristoranti
      if (!analysisResult.isRestaurantReview && captionText) {
        console.log(`[API Scrape] Analisi combinata fallita per ${videoUrl}. Riprovo con sola didascalia (caption).`);
        const captionOnlyResult = await analyzeText(captionText);
        if (captionOnlyResult.isRestaurantReview) {
          analysisResult = captionOnlyResult;
        }
      }

      if (analysisResult.error || !analysisResult.isRestaurantReview) {
        if(analysisResult.error) console.error(`Errore analisi per ${videoUrl}: ${analysisResult.error}`);
        else console.log(`Il video ${videoUrl} non è una recensione di ristorante valida o mancano dati essenziali.`);
        return [] as ScrapedData[];
      }
      
      // Sostiene più ristoranti per video
      const restaurantsList = analysisResult.restaurants && analysisResult.restaurants.length > 0
        ? analysisResult.restaurants
        : [{
            restaurantName: analysisResult.restaurantName || '',
            dishDescription: analysisResult.dishDescription || '',
            creatorOpinion: analysisResult.creatorOpinion || '',
            restaurantLocation: analysisResult.restaurantLocation || '',
          }];

      const items: ScrapedData[] = [];
      for (const r of restaurantsList) {
        if (!r.restaurantName) {
          continue;
        }
        // 5. Geocode restaurant location per ciascun ristorante
        const geocodeResult = await geocodeRestaurant(
          r.restaurantName,
          r.restaurantLocation || ''
        );
        if (geocodeResult.error) {
          console.warn(`[Geocoding] Non è stato possibile geolocalizzare "${r.restaurantName}, ${r.restaurantLocation}". Errore: ${geocodeResult.error}`);
        }

        const restaurantAnalysis: RestaurantAnalysis = {
          restaurantName: r.restaurantName,
          dishDescription: r.dishDescription || 'N/A',
          creatorOpinion: r.creatorOpinion || 'N/A',
          restaurantLocation: r.restaurantLocation || geocodeResult.formattedAddress || '',
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
        items.push(scrapedData);
      }

      return items;

    } catch (e) {
      console.error(`Errore grave durante l'analisi del video ${videoUrl}:`, e);
      return null;
    }
  });

  const nestedResults = await Promise.all(analysisPromises);
  const results = nestedResults.flat().filter(Boolean) as ScrapedData[];

  console.log(`[API Scrape] Analisi completata. Restituiti ${results.length} risultati validi.`);

  return NextResponse.json(results);
}
