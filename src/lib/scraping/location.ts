// src/lib/scraping/location.ts

interface GeocodeResult {
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  name?: string;
  placeId?: string;
  error?: string;
}

export async function geocodeRestaurant(
  name: string,
  location: string
): Promise<GeocodeResult> {
  const query = `${name}, ${location}`;
  const apiKey = "AIzaSyDKs0ZWA1bAaNXpiaEeabAXnfAEfgJuolU";
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    console.log(`[Geocoding] Sto cercando: "${query}" con Google Places API`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`La richiesta a Google Places API è fallita con stato: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const bestMatch = data.results[0];
      console.log(`[Geocoding] Trovato: "${bestMatch.name}" - ${bestMatch.formatted_address}`);
      return {
        latitude: bestMatch.geometry.location.lat,
        longitude: bestMatch.geometry.location.lng,
        formattedAddress: bestMatch.formatted_address,
        name: bestMatch.name,
        placeId: bestMatch.place_id,
      };
    } else {
      console.warn(`[Geocoding] Nessun risultato per: "${query}". Status: ${data.status}`);
      return {
        error: data.status === "ZERO_RESULTS" ? "No results found" : data.status,
      };
    }
  } catch (error) {
    console.error(`[Geocoding] Errore durante la geocodifica per "${query}":`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown geocoding error",
    };
  }
}
