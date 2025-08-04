import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

interface ProfileScraperResult {
    videoUrls?: string[];
    error?: string;
}

export async function scrapeProfile(profileUrl: string, limit: number = 50): Promise<ProfileScraperResult> {
    if (!process.env.APIFY_API_TOKEN) {
        console.error("APIFY_API_TOKEN non è configurato.");
        return { error: "Configurazione Apify mancante sul server." };
    }

    const isTikTok = profileUrl.includes('tiktok.com');
    const isInstagram = profileUrl.includes('instagram.com');

    if (!isTikTok && !isInstagram) {
        return { error: 'URL del profilo non supportato. Inserisci un URL di TikTok o Instagram.' };
    }

    const actorId = isTikTok ? '0FXVyOXXEmdGcV88a' : 'apify/instagram-profile-scraper';
    const runInput = isTikTok ? {
        "profiles": [profileUrl],
        "resultsPerPage": limit, 
        "shouldDownloadVideos": false
    } : {
        "usernames": [new URL(profileUrl).pathname.split('/').filter(Boolean)[0]], // Estrae username da URL
        "resultsLimit": limit
    };

    try {
        console.log(`Calling Apify actor '${actorId}' with input:`, runInput);
        const run = await apifyClient.actor(actorId).call(runInput);
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (items && items.length > 0) {
            const videoUrls = items.map(item => {
                if (isTikTok) {
                    const urlKey = Object.keys(item).find(key => key.toLowerCase().includes('url'));
                    return urlKey ? (item as any)[urlKey] : (item as any).downloadAddr || (item as any).videoUrl;
                }
                return (item as any).url;
            }).filter(Boolean);
            return { videoUrls };
        } else {
            return { error: "Nessun post trovato sul profilo o il profilo è privato." };
        }
    } catch (e: any) {
        console.error(`Errore durante lo scraping del profilo con Apify (attore: ${actorId}):`, e);
        return { error: `Errore Apify: ${e.message}` };
    }
}
