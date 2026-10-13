// Review URL Generation and Parsing Utilities

export function buildDirectReviewUrl(placeId: string): string {
  if (!placeId) return '';
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

export function buildCidReviewUrl(cid: string): string {
  if (!cid) return '';
  return `https://maps.google.com/?cid=${encodeURIComponent(cid.trim())}`;
}

export function buildSearchIntentUrl(name: string, placeId?: string): string {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.trim())}`;
  if (placeId) {
    return `${base}&query_place_id=${encodeURIComponent(placeId.trim())}`;
  }
  return base;
}

export function isValidUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidHttps(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Calculates raw byte size of the URL plus NDEF URI record overhead.
 * Web NFC NDEF URI Record format:
 * - 1 byte Status / Flags
 * - 1 byte Type Length (1 = 'U')
 * - 1 or 4 bytes Payload Length
 * - 1 byte Record Type ('U')
 * - 1 byte URI Identifier Code (e.g. 0x03 = "http://", 0x04 = "https://")
 * - UTF-8 encoded remaining string
 */
export function estimateNdefByteSize(url: string): number {
  if (!url) return 0;
  
  let stripped = url;
  // Prefix abbreviation code replaces protocol:
  if (url.startsWith('https://www.')) {
    stripped = url.slice('https://www.'.length);
  } else if (url.startsWith('https://')) {
    stripped = url.slice('https://'.length);
  } else if (url.startsWith('http://www.')) {
    stripped = url.slice('http://www.'.length);
  } else if (url.startsWith('http://')) {
    stripped = url.slice('http://'.length);
  }

  const encoder = new TextEncoder();
  const uriBytes = encoder.encode(stripped).length;
  // 1 byte identifier code + ~4 bytes header
  return uriBytes + 1 + 4;
}

/**
 * Extract Place ID or CID from pasted Google Maps URLs
 */
export function parseGoogleMapsUrl(input: string): { placeId?: string; cid?: string; detectedUrl?: string } {
  if (!input) return {};

  try {
    const parsed = new URL(input);

    // Direct writereview format
    if (parsed.searchParams.has('placeid')) {
      return { placeId: parsed.searchParams.get('placeid') || undefined, detectedUrl: input };
    }

    // query_place_id in search URL
    if (parsed.searchParams.has('query_place_id')) {
      return { placeId: parsed.searchParams.get('query_place_id') || undefined, detectedUrl: input };
    }

    // CID format
    if (parsed.searchParams.has('cid')) {
      return { cid: parsed.searchParams.get('cid') || undefined, detectedUrl: input };
    }

    // ChId format in google search
    if (parsed.searchParams.has('ludocid')) {
      return { cid: parsed.searchParams.get('ludocid') || undefined, detectedUrl: input };
    }

    // In path: e.g. /maps/place/.../data=!4m...
    const matchChId = input.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
    if (matchChId && matchChId[1]) {
      // Hex representation sometimes corresponds to CID
      const parts = matchChId[1].split(':');
      if (parts[1]) {
        try {
          const decimalCid = BigInt(parts[1]).toString();
          return { cid: decimalCid, detectedUrl: input };
        } catch {
          // Fall through
        }
      }
    }
  } catch {
    // If not a valid URL, it might be a direct place ID (starts with ChIJ or similar)
    if (/^[A-Za-z0-9_-]{20,}$/.test(input.trim())) {
      return { placeId: input.trim() };
    }
  }

  return {};
}
