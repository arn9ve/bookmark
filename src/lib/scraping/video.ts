import tiktok from '@tobyg74/tiktok-api-dl';
import { ApifyClient } from 'apify-client';
import type { VideoDetailsBase } from '@/src/types';

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchInstagramData(videoUrl: string): Promise<VideoDetailsBase> {
  console.log(`Recupero informazioni da Instagram per: ${videoUrl} usando Apify`);
  if (!process.env.APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN non è configurato.");
    return { error: "Configurazione Apify mancante sul server.", platform: "instagram" };
  }
  try {
    const runInput = {
      directUrls: [videoUrl],
      resultsLimit: 1,
    };
    console.log("Calling Apify actor 'apify/instagram-scraper' with input:", runInput);
    const run = await apifyClient.actor("apify/instagram-scraper").call(runInput);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    if (items && items.length > 0) {
      const postDetail = items[0] as any;
      const audioUrl = postDetail.videoUrl || postDetail.video_url;
      const description = postDetail.caption || postDetail.description || '';
      let title = postDetail.title || (description ? description.split('\n')[0] : '');
      if (!title && postDetail.ownerUsername) title = `Reel di ${postDetail.ownerUsername}`;
      if (!title && postDetail.username) title = `Post di ${postDetail.username}`;
      if (!title) title = "Titolo Instagram non disponibile";
      const author = postDetail.ownerUsername || postDetail.username;
      const thumbnailUrl = postDetail.displayUrl || postDetail.thumbnailUrl || postDetail.firstImage || postDetail.imageUrl;
      const likes = postDetail.likesCount;
      const saves = postDetail.saveCount; // Questo campo potrebbe non essere corretto, da verificare
      const shares = postDetail.videoShareCount; // Questo campo potrebbe non essere corretto, da verificare

      return {
        audioUrl,
        description,
        title,
        author,
        thumbnailUrl,
        likes,
        saves,
        shares,
        platform: "instagram"
      };
    } else {
      return { error: "Nessun dato recuperato da Apify per l'URL fornito.", platform: "instagram" };
    }
  } catch (e: any) {
    console.error("Errore durante il recupero dati da Instagram con Apify:", e);
    let errorMessage = "Errore Apify: Impossibile recuperare i dati.";
    if (e.message) errorMessage = `Errore Apify: ${e.message}`;
    return { error: errorMessage, platform: "instagram" };
  }
}

async function fetchTikTokDataDirectly(videoUrl: string): Promise<VideoDetailsBase> {
  const MAX_RETRIES_TIKTOK = 3;
  const RETRY_DELAY_MS_TIKTOK = 1500;
  let tiktokResult: any;
  let tiktokDescription: string | undefined = undefined;
  let tiktokAttempts = 0;
  let tiktokAudioUrl: string | undefined = undefined;
  const videoDetails: VideoDetailsBase = { platform: "tiktok" };

  console.log(`[Direct Scrape] Processing TikTok URL: ${videoUrl}`);
  while (tiktokAttempts < MAX_RETRIES_TIKTOK && tiktokDescription === undefined) {
    tiktokAttempts++;
    console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} for URL: ${videoUrl}`);
    try {
      tiktokResult = await tiktok.Downloader(videoUrl, { version: "v1" });
      console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} raw result:`, JSON.stringify(tiktokResult, null, 2));

      if (tiktokResult && tiktokResult.status === 'success') {
        if (tiktokResult.result) {
          console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts}: status success, result object present.`);
          console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} result.desc type: ${typeof tiktokResult.result.desc}, value: ${tiktokResult.result.desc}`);
          console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} full result object:`, JSON.stringify(tiktokResult.result, null, 2));
          
          tiktokDescription = tiktokResult.result.desc as string | undefined;
          if (tiktokDescription !== undefined) {
            console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} success: Description found.`);
            if (tiktokResult.result?.music?.playUrl && Array.isArray(tiktokResult.result.music.playUrl) && tiktokResult.result.music.playUrl.length > 0 && typeof tiktokResult.result.music.playUrl[0] === 'string') {
              tiktokAudioUrl = tiktokResult.result.music.playUrl[0];
            } else if (tiktokResult.result?.video?.download_addr && typeof tiktokResult.result.video.download_addr === 'string') {
              tiktokAudioUrl = tiktokResult.result.video.download_addr;
            } else if (tiktokResult.result?.video?.download_addr?.url_list && Array.isArray(tiktokResult.result.video.download_addr.url_list) && tiktokResult.result.video.download_addr.url_list.length > 0) {
              tiktokAudioUrl = tiktokResult.result.video.download_addr.url_list[0];
            } else if (tiktokResult.result?.video?.play_addr?.url_list && Array.isArray(tiktokResult.result.video.play_addr.url_list) && tiktokResult.result.video.play_addr.url_list.length > 0) {
              tiktokAudioUrl = tiktokResult.result.video.play_addr.url_list[0];
            }
            console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} audio URL: ${tiktokAudioUrl || 'Not found'}`);
            break;
          } else {
            console.warn(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts}: status success, result present, but no description (tiktokResult.result.desc is undefined).`);
          }
        } else {
          console.warn(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts}: status success, but tiktokResult.result is null or undefined.`);
        }
      } else {
        console.warn(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} failed or no result: status was '${tiktokResult?.status}', result was '${tiktokResult?.result ? 'present' : 'absent'}. Full tiktokResult:`, JSON.stringify(tiktokResult, null, 2));
      }
    } catch (tiktokError: any) {
      console.error(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} threw an error:`, tiktokError.message ? tiktokError.message : tiktokError);
      if (tiktokError.stack) {
        console.error(`[Vercel Debug - Direct] TikTok error stack: ${tiktokError.stack}`);
      }
      console.log(`[Vercel Debug - Direct] TikTok attempt #${tiktokAttempts} full tiktokResult object after error:`, JSON.stringify(tiktokResult, null, 2));
    }
    if (tiktokAttempts < MAX_RETRIES_TIKTOK && tiktokDescription === undefined) {
      console.log(`[Vercel Debug - Direct] Waiting ${RETRY_DELAY_MS_TIKTOK}ms before next TikTok attempt.`);
      await delay(RETRY_DELAY_MS_TIKTOK);
    }
  }

  if (tiktokDescription === undefined) {
    console.error(`[Vercel Debug - Direct] Failed to get TikTok description after ${MAX_RETRIES_TIKTOK} attempts for URL: ${videoUrl}. Final tiktokResult:`, JSON.stringify(tiktokResult, null, 2));
    videoDetails.error = `Impossibile recuperare info valide (descrizione) da TikTok tramite scraping diretto dopo ${MAX_RETRIES_TIKTOK} tentativi.`;
    return videoDetails;
  }
  if (!tiktokResult || (tiktokResult.status === 'success' && !tiktokResult.result)) {
    console.error(`[Vercel Debug - Direct] Unexpected response structure from TikTok API for ${videoUrl}. 'result' might be missing in success. Final tiktokResult:`, JSON.stringify(tiktokResult, null, 2));
    videoDetails.error = `Risposta inattesa da TikTok API (diretta) per ${videoUrl}. Potrebbe mancare 'result' nel successo.`;
    return videoDetails;
  }

  videoDetails.audioUrl = tiktokAudioUrl;
  videoDetails.description = tiktokDescription;
  videoDetails.title = tiktokResult.result?.desc || "Titolo TikTok non disponibile";
  videoDetails.author = tiktokResult.result?.author?.nickname || tiktokResult.result?.author?.unique_id;
  videoDetails.thumbnailUrl = tiktokResult.result?.video?.cover || tiktokResult.result?.video?.origin_cover;
  videoDetails.likes = tiktokResult.result?.stats?.diggCount;
  videoDetails.saves = tiktokResult.result?.stats?.collectCount;
  videoDetails.shares = tiktokResult.result?.stats?.shareCount;
  delete videoDetails.error;
  return videoDetails;
}

async function fetchTikTokDataWithApify(videoUrl: string): Promise<VideoDetailsBase> {
  console.log(`[Fallback Apify] Recupero informazioni da TikTok per: ${videoUrl} usando Apify actor clockworks/tiktok-video-scraper`);
  if (!process.env.APIFY_API_TOKEN) {
    console.error("[Fallback Apify] APIFY_API_TOKEN non è configurato.");
    return { error: "Configurazione Apify mancante sul server per TikTok.", platform: "tiktok" };
  }
  try {
    const runInput = {
      postURLs: [videoUrl],
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadSubtitles: false,
      shouldDownloadVideos: false,
    };
    console.log("[Fallback Apify] Calling Apify actor 'clockworks/tiktok-video-scraper' with input:", runInput);
    const run = await apifyClient.actor("clockworks/tiktok-video-scraper").call(runInput);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    if (items && items.length > 0) {
      const videoDetail = items[0] as any; 
      console.log("[Fallback Apify] TikTok data from Apify:", JSON.stringify(videoDetail, null, 2));
      const audioUrl = videoDetail.musicMeta?.playUrl || videoDetail.musicMeta?.music?.playUrl || videoDetail.videoMeta?.downloadAddr;
      const description = videoDetail.text || videoDetail.desc || videoDetail.description || "";
      let title = videoDetail.title || (description ? description.split('\n')[0] : '');
      if (!title && videoDetail.authorMeta?.name) title = `Video di ${videoDetail.authorMeta.name}`;
      if (!title) title = "Titolo TikTok (Apify) non disponibile";
      
      const author = videoDetail.authorMeta?.name || videoDetail.authorMeta?.nickName || videoDetail.authorMeta?.uniqueId;
      const thumbnailUrl = videoDetail.videoMeta?.coverUrl || videoDetail.videoMeta?.cover || videoDetail.videoMeta?.originCover;
      const likes = videoDetail.diggCount;
      const saves = videoDetail.collectCount;
      const shares = videoDetail.shareCount;

      if (!description && !audioUrl) {
        console.warn("[Fallback Apify] Apify ha restituito dati ma mancano descrizione e audioUrl.");
      }

      return {
        audioUrl,
        description,
        title,
        author,
        thumbnailUrl,
        likes,
        saves,
        shares,
        platform: "tiktok"
      };
    } else {
      console.warn("[Fallback Apify] Nessun dato recuperato da Apify per l'URL TikTok fornito.");
      return { error: "Nessun dato recuperato da Apify per l'URL TikTok fornito.", platform: "tiktok" };
    }
  } catch (e: any) {
    console.error("[Fallback Apify] Errore during il recupero dati da TikTok con Apify:", e);
    let errorMessage = "Errore Apify TikTok: Impossibile recuperare i dati.";
    if (e.message) errorMessage = `Errore Apify TikTok: ${e.message}`;
    if (e.type && e.message) errorMessage = `Errore Apify TikTok (${e.type}): ${e.message}`;
    return { error: errorMessage, platform: "tiktok" };
  }
}

export async function getVideoInfo(videoUrl: string): Promise<VideoDetailsBase> {
    let videoDetails: VideoDetailsBase = { platform: 'unknown' };

    if (videoUrl.includes('tiktok.com')) {
      videoDetails.platform = "tiktok";
      console.log(`Inizio recupero dati per TikTok URL: ${videoUrl}`);
      
      let directScrapeDetails = await fetchTikTokDataDirectly(videoUrl);

      if (directScrapeDetails && !directScrapeDetails.error && directScrapeDetails.description) {
        console.log("Recupero TikTok tramite scraping diretto riuscito.");
        videoDetails = directScrapeDetails;
      } else {
        console.warn("Scraping diretto TikTok fallito o descrizione non trovata. Tentativo con Apify fallback.");
        if(directScrapeDetails && directScrapeDetails.error){
            console.warn(`Dettaglio errore scraping diretto: ${directScrapeDetails.error}`);
        }
        videoDetails = await fetchTikTokDataWithApify(videoUrl);
        if (videoDetails.error) {
            console.error(`Fallback Apify per TikTok fallito anche. Errore: ${videoDetails.error}`);
        } else {
            console.log("Recupero TikTok tramite fallback Apify riuscito.");
        }
      }
    } else if (videoUrl.includes('instagram.com')) {
      videoDetails = await fetchInstagramData(videoUrl);
    } else {
      videoDetails.error = 'URL video non supportato';
    }

    return videoDetails;
}
