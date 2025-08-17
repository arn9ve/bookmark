import OpenAI from 'openai';
import type { AnalysisResult, BasicRestaurantInfo, RestaurantAnalysis } from '../../types';
import { classifyRestaurant } from './classification';

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function analyzeText(textToAnalyze: string): Promise<AnalysisResult> {
  if (!textToAnalyze) {
    return { error: 'Missing text to analyze', isRestaurantReview: false };
  }

  console.log("[analyzeText] Testo da analizzare ricevuto:", textToAnalyze);

  const deepSeekPrompt = `Analizza il seguente testo (può contenere didascalia/caption e/o trascrizione audio del video) e determina se si tratta di una recensione di luoghi di food & beverage (ristoranti, bar, caffè, pasticcerie, chioschi, cocktail bar, gelaterie, bakery, ramen shop, izakaya, ecc.). Struttura le informazioni in JSON.

Il JSON DEVE includere SEMPRE questi campi di base:
- "isRestaurantReview": (boolean) true se il video contiene almeno un LOCALE FOOD/BEVANDE (anche se non viene usata la parola "ristorante").
- "restaurantName": (string) Il nome del locale PRINCIPALE menzionato. Se più locali, metti il primo. Se non è una recensione, stringa vuota.
- "dishDescription": (string) Breve descrizione del piatto/bevanda. Se non presente, stringa vuota.
- "creatorOpinion": (string) Breve riassunto del parere del creator. Se non presente, stringa vuota.
- "restaurantLocation": (string) Area o città (es. "Shibuya, Tokyo"). Se presente solo una città/area (anche come hashtag tipo #tokyo), usarla qui.

SE sono presenti PIÙ locali, aggiungi anche il campo "restaurants" come ARRAY, dove ogni elemento ha:
- "restaurantName" (string)
- "dishDescription" (string)
- "creatorOpinion" (string)
- "restaurantLocation" (string)

Linee guida importanti:
- Considera validi anche locali come caffetterie, bar, cocktail bar, gelaterie, colazionerie, fast food, catene, street food, chioschi e negozi di bevande (es. craft cola, bubble tea).
- Se il testo contiene nomi propri di locali (da hashtag o testo) e una città/area, imposta "isRestaurantReview" a true anche se manca una descrizione del piatto.
- Se non è specificato un indirizzo preciso ma è presente una città/area, valorizza "restaurantLocation" con la città/area.
- Estrai TUTTI i locali menzionati, in ordine di apparizione (FINO A 15). Includi un elemento anche se hai solo il nome; compila gli altri campi se deducibili.

Ecco il testo:

${textToAnalyze}

Restituisci SOLO il JSON. Se un'informazione non è presente, usa "" per quel campo.`;

  console.log("[analyzeText] Prompt completo per DeepSeek:", deepSeekPrompt);

  try {
    const completion = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "Sei un assistente AI esperto nell'analizzare trascrizioni di video per recensioni di ristoranti e strutturare le informazioni in JSON." },
        { role: "user", content: deepSeekPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      console.log("Risposta JSON grezza da DeepSeek:", content);
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent.substring(7, cleanedContent.length - 3).trim();
      }
      const rawData = JSON.parse(cleanedContent);

      if (rawData.isRestaurantReview) {
        // Se c'è una lista di ristoranti, normalizzala e classificala
        const list: BasicRestaurantInfo[] | undefined = Array.isArray(rawData.restaurants)
          ? rawData.restaurants.map((r: any) => ({
              restaurantName: r?.restaurantName || '',
              dishDescription: r?.dishDescription || '',
              creatorOpinion: r?.creatorOpinion || '',
              restaurantLocation: r?.restaurantLocation || '',
            }))
          : undefined;

        if (list && list.length > 0) {
          const classifiedList: RestaurantAnalysis[] = list.map((r) => classifyRestaurant(r));
          const first = classifiedList[0]!;
          return {
            isRestaurantReview: true,
            restaurantName: first.restaurantName,
            dishDescription: first.dishDescription,
            creatorOpinion: first.creatorOpinion,
            restaurantLocation: first.restaurantLocation,
            priority: first.priority,
            isPorkSpecialist: first.isPorkSpecialist,
            restaurants: classifiedList.map(({ latitude, longitude, formattedAddress, ...rest }) => rest),
          };
        }

        // Fallback: singolo ristorante
        const baseAnalysis = {
          restaurantName: rawData.restaurantName || '',
          dishDescription: rawData.dishDescription || '',
          creatorOpinion: rawData.creatorOpinion || '',
          restaurantLocation: rawData.restaurantLocation || '',
        };
        const classified = classifyRestaurant(baseAnalysis);
        return {
          isRestaurantReview: true,
          restaurantName: classified.restaurantName,
          dishDescription: classified.dishDescription,
          creatorOpinion: classified.creatorOpinion,
          restaurantLocation: classified.restaurantLocation,
          priority: classified.priority,
          isPorkSpecialist: classified.isPorkSpecialist,
        };
      } else {
        return {
          isRestaurantReview: false,
        };
      }
    } else {
      console.error("Nessun contenuto nella risposta di DeepSeek.");
      return { error: "DeepSeek non ha restituito contenuto", isRestaurantReview: false };
    }
  } catch (error: unknown) {
    console.error('Errore in /api/analyzeText:', error);
    let errorMessage = 'Errore interno del server in analyzeText.';
    if (error instanceof OpenAI.APIError) {
        errorMessage = `Errore API DeepSeek: ${error.message}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { error: errorMessage, isRestaurantReview: false };
  }
}
