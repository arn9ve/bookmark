import { NextResponse } from 'next/server';
import { geocodeRestaurant } from '../../../lib/scraping/location';

export async function POST(request: Request) {
  const { restaurantName, restaurantLocation } = await request.json();

  if (!restaurantName || !restaurantLocation) {
    return NextResponse.json(
      { error: 'restaurantName and restaurantLocation are required' },
      { status: 400 }
    );
  }

  try {
    const geocodeResult = await geocodeRestaurant(restaurantName, restaurantLocation);
    
    if (geocodeResult.error) {
      return NextResponse.json({ error: geocodeResult.error }, { status: 404 }); // Not Found
    }

    return NextResponse.json(geocodeResult);

  } catch (error) {
    console.error(`[API Geocode] Errore grave:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
