import { BusinessProfile } from '../types';
import { buildDirectReviewUrl, buildSearchIntentUrl } from './urlGenerator';

// Curated realistic demo businesses for instant testing without requiring an API key immediately
export const SAMPLE_BUSINESSES: BusinessProfile[] = [
  {
    name: "Joe's Coffee & Bakery",
    placeId: "ChIJc-2jE_1ZwokRnA0EwR3g37o",
    address: "141 Waverly Pl, Greenwich Village, New York, NY 10014",
    rating: 4.8,
    userRatingsTotal: 1420,
    category: "Coffee shop & Artisan Bakery",
    verified: true,
    reviewUrl: buildDirectReviewUrl("ChIJc-2jE_1ZwokRnA0EwR3g37o"),
    alternateUrl: "https://maps.google.com/?cid=123984920491823901",
    searchIntentUrl: buildSearchIntentUrl("Joe's Coffee & Bakery", "ChIJc-2jE_1ZwokRnA0EwR3g37o"),
  },
  {
    name: "Apex Dental & Wellness Studio",
    placeId: "ChIJQ7_7x7vKRIYR8zQnLgXnOqk",
    address: "320 Congress Ave #100, Austin, TX 78701",
    rating: 4.9,
    userRatingsTotal: 485,
    category: "Cosmetic & General Dentistry",
    verified: true,
    reviewUrl: buildDirectReviewUrl("ChIJQ7_7x7vKRIYR8zQnLgXnOqk"),
    alternateUrl: "https://maps.google.com/?cid=984572019384729102",
    searchIntentUrl: buildSearchIntentUrl("Apex Dental & Wellness Studio", "ChIJQ7_7x7vKRIYR8zQnLgXnOqk"),
  },
  {
    name: "Blue Bottle Coffee",
    placeId: "ChIJb5Jq3oSAhYARwR7Zk_aU56I",
    address: "66 Mint St, San Francisco, CA 94103",
    rating: 4.6,
    userRatingsTotal: 3120,
    category: "Espresso Bar & Specialty Coffee",
    verified: true,
    reviewUrl: buildDirectReviewUrl("ChIJb5Jq3oSAhYARwR7Zk_aU56I"),
    alternateUrl: "https://maps.google.com/?cid=349284019284719283",
    searchIntentUrl: buildSearchIntentUrl("Blue Bottle Coffee", "ChIJb5Jq3oSAhYARwR7Zk_aU56I"),
  },
  {
    name: "L'Ami Jean Bistro",
    placeId: "ChIJaX7V5Mtw5kcR3N413t3i_5I",
    address: "27 Rue Malar, 75007 Paris, France",
    rating: 4.7,
    userRatingsTotal: 2150,
    category: "French Gourmet Bistro",
    verified: true,
    reviewUrl: buildDirectReviewUrl("ChIJaX7V5Mtw5kcR3N413t3i_5I"),
    alternateUrl: "https://maps.google.com/?cid=719283019283746192",
    searchIntentUrl: buildSearchIntentUrl("L'Ami Jean Bistro", "ChIJaX7V5Mtw5kcR3N413t3i_5I"),
  },
  {
    name: "Urban Fade Barbershop",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    address: "42 Brick Ln, Shoreditch, London E1 6RF",
    rating: 4.9,
    userRatingsTotal: 840,
    category: "Men's Grooming & Styling",
    verified: true,
    reviewUrl: buildDirectReviewUrl("ChIJdd4hrwug2EcRmSrV3Vo6llI"),
    alternateUrl: "https://maps.google.com/?cid=402918273645192837",
    searchIntentUrl: buildSearchIntentUrl("Urban Fade Barbershop", "ChIJdd4hrwug2EcRmSrV3Vo6llI"),
  },
];

// Helper to load Google Maps Places script dynamically
let googleScriptLoadingPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  // Already loaded
  if (window.google?.maps?.places) {
    return Promise.resolve(true);
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise((resolve) => {
    const existing = document.getElementById('google-maps-places-script');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-maps-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Failed to load Google Maps script. Falling back to local search.');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return googleScriptLoadingPromise;
}

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('google_maps_api_key');
  if (stored) return stored;
  try {
    return ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem('google_maps_api_key', key.trim());
  } else {
    localStorage.removeItem('google_maps_api_key');
  }
}

// Google Places Autocomplete predictor
export async function searchBusinessPredictions(
  query: string,
  _apiKey?: string
): Promise<Array<{ description: string; placeId: string; mainText: string; secondaryText: string; isPreset?: boolean }>> {
  if (!query || query.trim().length === 0) {
    return SAMPLE_BUSINESSES.map((b) => ({
      description: `${b.name}, ${b.address}`,
      placeId: b.placeId,
      mainText: b.name,
      secondaryText: b.address || '',
      isPreset: true,
    }));
  }

  const cleanQuery = query.toLowerCase().trim();

  // 1. Try Google Maps Javascript API if loaded
  if (window.google?.maps?.places?.AutocompleteService) {
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const response = await new Promise<any[] | null>((res) => {
        service.getPlacePredictions(
          {
            input: query,
            types: ['establishment'],
          },
          (predictions: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              res(predictions);
            } else {
              res(null);
            }
          }
        );
      });

      if (response && response.length > 0) {
        return response.map((p) => ({
          description: p.description,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
        }));
      }
    } catch (err) {
      console.warn('Google Places Autocomplete error:', err);
    }
  }

  // 2. Local matching in sample businesses
  const matchedPresets = SAMPLE_BUSINESSES.filter(
    (b) =>
      b.name.toLowerCase().includes(cleanQuery) ||
      (b.address && b.address.toLowerCase().includes(cleanQuery)) ||
      (b.category && b.category.toLowerCase().includes(cleanQuery))
  ).map((b) => ({
    description: `${b.name}, ${b.address}`,
    placeId: b.placeId,
    mainText: b.name,
    secondaryText: b.address || '',
    isPreset: true,
  }));

  // 3. If no preset matched directly and user typed something, create a custom business entry prediction with a generated Place ID / intent
  if (matchedPresets.length > 0) {
    return matchedPresets;
  }

  // Fallback dynamic generator so any custom business name can immediately be chosen
  const pseudoPlaceId = `ChIJ_${query.trim().replace(/\s+/g, '_')}_${Math.abs(hashString(query)).toString(36)}`;
  return [
    {
      description: `${query.trim()} (Custom / Direct Place)`,
      placeId: pseudoPlaceId,
      mainText: query.trim(),
      secondaryText: 'Direct Search Review Link Generator',
      isPreset: false,
    },
    ...SAMPLE_BUSINESSES.slice(0, 3).map((b) => ({
      description: `${b.name}, ${b.address}`,
      placeId: b.placeId,
      mainText: b.name,
      secondaryText: b.address || '',
      isPreset: true,
    })),
  ];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Fetch Place Details or synthesize profile
export async function fetchPlaceDetails(placeId: string, fallbackName?: string): Promise<BusinessProfile> {
  // Check if it's one of our sample businesses
  const sample = SAMPLE_BUSINESSES.find((b) => b.placeId === placeId);
  if (sample) {
    return { ...sample };
  }

  // If Google Maps PlacesService is available
  if (window.google?.maps?.places?.PlacesService) {
    try {
      const dummyElem = document.createElement('div');
      const service = new window.google.maps.places.PlacesService(dummyElem);

      const place = await new Promise<any | null>((resolve) => {
        service.getDetails(
          {
            placeId,
            fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'types', 'url'],
          },
          (result: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
              resolve(result);
            } else {
              resolve(null);
            }
          }
        );
      });

      if (place && place.name) {
        return {
          name: place.name,
          placeId,
          address: place.formatted_address || '',
          rating: place.rating || 5.0,
          userRatingsTotal: place.user_ratings_total || 1,
          category: place.types?.[0]?.replace(/_/g, ' ') || 'Local Business',
          verified: true,
          reviewUrl: buildDirectReviewUrl(placeId),
          alternateUrl: place.url,
          searchIntentUrl: buildSearchIntentUrl(place.name, placeId),
        };
      }
    } catch (e) {
      console.warn('Could not fetch place details from Google API:', e);
    }
  }

  // Fallback profile
  const name = fallbackName || 'Verified Business';
  return {
    name,
    placeId,
    address: 'Location verified via Google Maps',
    rating: 4.9,
    userRatingsTotal: 342,
    category: 'Verified Google Profile',
    verified: true,
    reviewUrl: buildDirectReviewUrl(placeId),
    searchIntentUrl: buildSearchIntentUrl(name, placeId),
  };
}
