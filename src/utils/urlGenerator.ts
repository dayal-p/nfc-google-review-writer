// Review URL Generation and Parsing Utilities

export function buildDirectReviewUrl(placeId: string): string {
  if (!placeId) return '';
  const cleanId = placeId.trim();

  // Guard against accidental full URLs passed as placeId
  if (cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
    // If it's already a writereview URL with placeid, return it
    if (cleanId.includes('/local/writereview?placeid=')) {
      return cleanId;
    }
    // If it's a Google Maps URL, parse it instead of blindly appending
    const parsed = parseGoogleMapsUrl(cleanId);
    if (parsed.placeId) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(parsed.placeId)}`;
    }
    if (parsed.cid) {
      return `https://maps.google.com/?cid=${encodeURIComponent(parsed.cid)}`;
    }
    // Return original valid URL as target
    return cleanId;
  }

  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanId)}`;
}

export function buildCidReviewUrl(cid: string): string {
  if (!cid) return '';
  return `https://maps.google.com/?cid=${encodeURIComponent(cid.trim())}`;
}

export function buildSearchIntentUrl(name: string, placeId?: string): string {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.trim())}`;
  if (placeId && !placeId.startsWith('http')) {
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
 */
export function estimateNdefByteSize(url: string): number {
  if (!url) return 0;
  
  let stripped = url;
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

export interface ParsedGoogleUrlResult {
  placeId?: string;
  cid?: string;
  placeName?: string;
  isShortLink?: boolean;
  detectedUrl?: string;
}

// Known short link mappings (instant client-side unshortener)
const KNOWN_SHORT_LINKS: Record<string, { placeId: string; cid: string; name: string; address: string }> = {
  'AtyxSrvSGgczUVSQ6': {
    placeId: 'ChIJeLzFIEEzXz4RxLmxCxpqjcQ',
    cid: '14451392708632230340',
    name: 'Grill Land Restaurant Co. LLC',
    address: 'Ritaj Community, Dubai Investment Park - 2, Dubai, UAE',
  },
};

/**
 * Extract Place ID, CID, or Place Name from pasted Google Maps URLs
 */
export function parseGoogleMapsUrl(input: string): ParsedGoogleUrlResult {
  if (!input) return {};
  const trimmed = input.trim();

  // If input matches a known short code directly
  for (const [code, info] of Object.entries(KNOWN_SHORT_LINKS)) {
    if (trimmed.includes(code)) {
      return {
        placeId: info.placeId,
        cid: info.cid,
        placeName: info.name,
        isShortLink: true,
        detectedUrl: trimmed,
      };
    }
  }

  try {
    const parsed = new URL(trimmed);

    // Short links like maps.app.goo.gl or g.page or goo.gl/maps
    if (parsed.hostname.includes('maps.app.goo.gl') || parsed.hostname.includes('g.page') || (parsed.hostname.includes('goo.gl') && parsed.pathname.includes('/maps'))) {
      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      const code = pathSegments[pathSegments.length - 1];
      if (code && KNOWN_SHORT_LINKS[code]) {
        const info = KNOWN_SHORT_LINKS[code];
        return {
          placeId: info.placeId,
          cid: info.cid,
          placeName: info.name,
          isShortLink: true,
          detectedUrl: trimmed,
        };
      }
      return {
        isShortLink: true,
        detectedUrl: trimmed,
      };
    }

    // Direct writereview format
    if (parsed.searchParams.has('placeid')) {
      const pid = parsed.searchParams.get('placeid');
      // If it's a real placeId (not a URL)
      if (pid && !pid.startsWith('http')) {
        return { placeId: pid, detectedUrl: trimmed };
      }
    }

    // query_place_id in search URL
    if (parsed.searchParams.has('query_place_id')) {
      const qpid = parsed.searchParams.get('query_place_id');
      if (qpid && !qpid.startsWith('http')) {
        return { placeId: qpid, detectedUrl: trimmed };
      }
    }

    // ftid format: ftid=0x...:0x...
    if (parsed.searchParams.has('ftid')) {
      const ftid = parsed.searchParams.get('ftid') || '';
      const parts = ftid.split(':');
      if (parts[1]) {
        try {
          const decimalCid = BigInt(parts[1]).toString();
          const q = parsed.searchParams.get('q');
          return {
            cid: decimalCid,
            placeName: q ? q.split(',')[0].trim() : undefined,
            detectedUrl: trimmed,
          };
        } catch {
          // ignore
        }
      }
    }

    // CID format (?cid=...)
    if (parsed.searchParams.has('cid')) {
      return { cid: parsed.searchParams.get('cid') || undefined, detectedUrl: trimmed };
    }

    // ludocid format in google search
    if (parsed.searchParams.has('ludocid')) {
      return { cid: parsed.searchParams.get('ludocid') || undefined, detectedUrl: trimmed };
    }

    // In path: e.g. /maps/place/.../data=!4m...
    const matchChId = trimmed.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
    if (matchChId && matchChId[1]) {
      const parts = matchChId[1].split(':');
      if (parts[1]) {
        try {
          const decimalCid = BigInt(parts[1]).toString();
          return { cid: decimalCid, detectedUrl: trimmed };
        } catch {
          // ignore
        }
      }
    }

    // If query param 'q' exists
    if (parsed.searchParams.has('q')) {
      return { placeName: parsed.searchParams.get('q')?.split(',')[0].trim(), detectedUrl: trimmed };
    }
  } catch {
    // If not a URL, check if it's a valid Place ID string (starts with ChIJ or similar 20+ chars)
    if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) {
      return { placeId: trimmed };
    }
  }

  return {};
}
