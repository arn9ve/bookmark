// src/lib/scraping/location.ts

interface GeocodeResult {
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  error?: string;
}

export async function geocodeRestaurant(
  name: string,
  location: string
): Promise<GeocodeResult> {
  // Combinazione più robusta per la query
  const query = `${name}, ${location}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;

  try {
    console.log(`[Geocoding] Sto cercando: "${query}"`);
    const response = await fetch(url, {
      headers: {
        // L'API di Nominatim richiede un User-Agent personalizzato
        "User-Agent": "SiChefApp/1.0 (contact@sichef.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`La richiesta a Nominatim è fallita con stato: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const bestMatch = data[0];
      console.log(`[Geocoding] Trovato: "${bestMatch.display_name}"`);
      return {
        latitude: parseFloat(bestMatch.lat),
        longitude: parseFloat(bestMatch.lon),
        formattedAddress: bestMatch.display_name,
      };
    } else {
      console.warn(`[Geocoding] Nessun risultato per: "${query}"`);
      return {
        error: "No results found",
      };
    }
  } catch (error) {
    console.error(`[Geocoding] Errore durante la geocodifica per "${query}":`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown geocoding error",
    };
  }
}
