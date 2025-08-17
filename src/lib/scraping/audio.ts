import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { TranscribeAudioResponse, VideoDetailsBase } from '../../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText} from URL: ${url}`);
  }
  if (!response.body) {
    throw new Error('Response body is null');
  }
  const bodyStream = Readable.fromWeb(response.body as import('stream/web').ReadableStream<Uint8Array>);
  await pipeline(bodyStream, fs.createWriteStream(outputPath));
}

export async function transcribeAudio(
    videoDetails: VideoDetailsBase
  ): Promise<TranscribeAudioResponse> {
    let tempFilePath: string = "";
  
    try {
      const { audioUrl, description: originalDescription, platform } = videoDetails;
  
      if (!audioUrl) {
        return { transcriptionText: originalDescription || "URL audio non fornito, trascrizione saltata.", error: "Audio URL mancante" };
      }
      if (!platform) {
        return { transcriptionText: originalDescription || "Piattaforma non fornita, trascrizione saltata.", error: "Piattaforma mancante" };
      }
  
      let skipWhisper = false;
      console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Descrizione originale:`, originalDescription);
      
      if (!originalDescription || originalDescription.length < 100) {
        console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Descrizione troppo breve o assente, uso Whisper`);
        skipWhisper = false;
      } else {
        const ingredientKeywords = ['ingredienti', 'gr', 'grammi', 'ml', 'cucchiai', 'cucchiaio', 'tazza', 'tazze'];
        const procedureKeywords = ['procedimento', 'preparazione', 'cuocete', 'aggiungete', 'mescolate', 'fate', 'mettete', 'versate', 'tagliate', 'scaldate'];
        const recipeStructureKeywords = ['ingredienti:', 'procedimento:', 'preparazione:', 'istruzioni:'];
        
        const hasIngredients = ingredientKeywords.some(keyword => originalDescription.toLowerCase().includes(keyword));
        const hasProcedure = procedureKeywords.some(keyword => originalDescription.toLowerCase().includes(keyword));
        const hasStructure = recipeStructureKeywords.some(keyword => originalDescription.toLowerCase().includes(keyword));
        
        const instructionCount = procedureKeywords.filter(keyword => originalDescription.toLowerCase().includes(keyword)).length;
        
        if (hasIngredients && hasProcedure && originalDescription.length > 300 && (hasStructure || instructionCount >= 3)) {
          console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Descrizione contiene ricetta COMPLETA, skippo Whisper`);
          skipWhisper = true;
        } else if (hasIngredients || hasProcedure) {
          console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Descrizione contiene ricetta PARZIALE, uso anche Whisper`);
          skipWhisper = false;
        } else {
          console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Descrizione non sembra contenere ricetta, uso Whisper`);
          skipWhisper = false;
        }
      }
      console.log(`[${platform.toUpperCase()} Pre-Whisper Check] Risultato: skipWhisper = ${skipWhisper}`);
  
      let transcription = "";
      if (!audioUrl) {
        console.log(`URL audio non disponibile per ${platform}.`);
        transcription = originalDescription || "";
      } else if (skipWhisper) {
        console.log(`Saltando Whisper per ${platform}, usando descrizione originale.`);
        transcription = originalDescription || "";
      } else {
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `transcribe-audio-${Date.now()}.mp3`);
        
        console.log(`Attempting to download audio from ${platform} URL: ${audioUrl}`);
        await downloadFile(audioUrl, tempFilePath);
        const stats = fs.statSync(tempFilePath);
        console.log(`Downloaded file size: ${stats.size} bytes`);
  
        if (stats.size === 0) {
          console.error("Downloaded file is empty. Skipping Whisper.");
          return { transcriptionText: originalDescription || "Errore: File audio scaricato è vuoto.", error: "File audio vuoto" };
        }
  
        // Prova formati e MIME corretti per evitare 400 su alcuni stream TikTok
        const fileStream = fs.createReadStream(tempFilePath);
        const whisperTranscription = await openai.audio.transcriptions.create({
          file: fileStream as unknown as File,
          model: 'gpt-4o-transcribe',
        }).catch(async (err) => {
          console.warn('Prima chiamata Whisper fallita, riprovo con modello fallback whisper-1:', err?.message || err);
          return openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath) as unknown as File,
            model: 'whisper-1',
          });
        });
        const transcriptionText = whisperTranscription.text;
        console.log(`Trascrizione Whisper (${platform}) completata.`);
        
        if (originalDescription && originalDescription.length > 50) {
          const hasRecipeContent = ['ingredienti', 'procedimento', 'preparazione', 'gr', 'grammi'].some(keyword => 
            originalDescription.toLowerCase().includes(keyword)
          );
          
          if (hasRecipeContent) {
            console.log(`[${platform.toUpperCase()}] Combinando descrizione + trascrizione Whisper`);
            transcription = `DESCRIZIONE ORIGINALE:\n${originalDescription}\n\nTRASCRIZIONE AUDIO:\n${transcriptionText}`;
          } else {
            transcription = transcriptionText;
          }
        } else {
          transcription = transcriptionText;
        }
      }
  
      return { transcriptionText: transcription };
  
    } catch (error: unknown) {
      console.error('Errore in transcribeAudio:', error);
      let errorMessage = 'Errore interno del server in transcribeAudio.';
      if (error instanceof Error) errorMessage = error.message;
      return { transcriptionText: videoDetails.description || "Errore trascrizione", error: errorMessage };
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); console.log(`File temp ${tempFilePath} eliminato.`); }
        catch (e) { console.error(`Errore eliminazione file temp:`, e); }
      }
    }
  }
