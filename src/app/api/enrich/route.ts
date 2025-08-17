import { NextResponse } from 'next/server';

type EnrichInputItem = {
  id: string;
  name?: string;
  address?: string;
  dish?: string;
  city?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body?.items || []) as EnrichInputItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ descriptions: {} }, { status: 200 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
    const useOpenAI = !!process.env.OPENAI_API_KEY;

    const descriptions: Record<string, string> = {};

    if (!apiKey) {
      // Fallback sintetico locale
      for (const it of items) {
        const pieces = [it.name, it.address, it.city].filter(Boolean).join(' · ');
        descriptions[it.id] = pieces ? `Luogo: ${pieces}` : '';
      }
      return NextResponse.json({ descriptions }, { status: 200 });
    }

    // Costruisci prompt conciso
    const prompt = `Scrivi una breve descrizione (1-2 frasi, max 220 caratteri) per ciascun ristorante, usando informazioni come nome, città, indirizzo e piatto quando disponibili. Rispondi come JSON con chiave=ID e valore=descrizione.
Input:
${JSON.stringify(items, null, 2)}
Output solo JSON:`;

    // Chiamata modello (OpenAI compatibile). Evitiamo dipendenze esterne, usiamo fetch raw.
    const url = useOpenAI
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions';

    const model = useOpenAI ? 'gpt-4o-mini' : 'deepseek-chat';

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Sei un assistente che restituisce output concisi e in formato richiesto.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      // Fallback semplice
      for (const it of items) {
        const pieces = [it.name, it.address, it.city].filter(Boolean).join(' · ');
        descriptions[it.id] = pieces ? `Luogo: ${pieces}` : '';
      }
      return NextResponse.json({ descriptions }, { status: 200 });
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      for (const it of items) {
        const pieces = [it.name, it.address, it.city].filter(Boolean).join(' · ');
        descriptions[it.id] = pieces ? `Luogo: ${pieces}` : '';
      }
      return NextResponse.json({ descriptions }, { status: 200 });
    }

    try {
      const parsed = JSON.parse(content);
      // Validazione leggera
      for (const it of items) {
        const val = parsed[it.id];
        descriptions[it.id] = typeof val === 'string' ? val : '';
      }
      return NextResponse.json({ descriptions }, { status: 200 });
    } catch {
      // Se non è JSON valido, fallback
      for (const it of items) {
        const pieces = [it.name, it.address, it.city].filter(Boolean).join(' · ');
        descriptions[it.id] = pieces ? `Luogo: ${pieces}` : '';
      }
      return NextResponse.json({ descriptions }, { status: 200 });
    }
  } catch (e) {
    return NextResponse.json({ descriptions: {} }, { status: 200 });
  }
}


