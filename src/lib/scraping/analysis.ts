import OpenAI from 'openai';
import type { AnalysisResult } from '../../types';

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function analyzeText(textToAnalyze: string): Promise<AnalysisResult> {
  if (!textToAnalyze) {
    return { error: 'Missing text to analyze', isRestaurantReview: false };
  }

  console.log("[analyzeText] Testo da analizzare ricevuto:", textToAnalyze);

  const deepSeekPrompt = `Analizza il seguente testo, che è la trascrizione di un video, e determina se si tratta di una recensione di un ristorante. Struttura le informazioni in un formato JSON.

Il JSON DEVE includere i seguenti campi:
- "isRestaurantReview": (boolean) true se il video è una recensione di un ristorante, altrimenti false.
- "restaurantName": (string) Il nome del ristorante. Se non è una recensione, lascia vuoto.
- "dishDescription": (string) Una breve descrizione del piatto mangiato. Se non è una recensione, lascia vuoto.
- "creatorOpinion": (string) Un breve riassunto del parere del creator sul cibo/ristorante. Se non è una recensione, lascia vuoto.
- "restaurantLocation": (string) L'area o l'indirizzo del ristorante (es. "Shibuya, Tokyo"). Se non è una recensione, lascia vuoto.

Ecco il testo:

${textToAnalyze}

Restituisci SOLO il JSON strutturato come descritto. Se un'informazione non è presente, usa una stringa vuota "" per quel campo.`;

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
        return {
          isRestaurantReview: true,
          restaurantName: rawData.restaurantName || '',
          dishDescription: rawData.dishDescription || '',
          creatorOpinion: rawData.creatorOpinion || '',
          restaurantLocation: rawData.restaurantLocation || '',
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
