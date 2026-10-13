// Review URL Generation and Parsing Utilities (Matching Product Mate Engine)

/**
 * Exact Product Mate algorithm:
 * Converts Google ftid (feature ID / hex coordinates + CID) to official Google Place ID.
 * Protocol Buffers:
 * field 1 (tag 0x0a), length 18 (0x12)
 * subfield 1 (tag 0x09, fixed64): part 1 (little endian)
 * subfield 2 (tag 0x11, fixed64): part 2 (little endian)
 * Output is URL-safe base64 without padding.
 */
export function ftidToPlaceId(hex1: string, hex2: string): string {
  try {
    const cleanHex1 = hex1.startsWith('0x') ? hex1 : `0x${hex1}`;
    const cleanHex2 = hex2.startsWith('0x') ? hex2 : `0x${hex2}`;
    const b1 = BigInt(cleanHex1);
    const b2 = BigInt(cleanHex2);

    const bytes = new Uint8Array(20);
    const view = new DataView(bytes.buffer);

    bytes[0] = 0x0a;
    bytes[1] = 0x12;
    bytes[2] = 0x09;
    view.setBigUint64(3, b1, true); // little endian
    bytes[11] = 0x11;
    view.setBigUint64(12, b2, true); // little endian

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.warn('Could not convert ftid to Place ID:', e);
    return '';
  }
}

export function buildDirectReviewUrl(placeId: string): string {
  if (!placeId) return '';
  const cleanId = placeId.trim();

  // Guard against accidental full URLs passed as placeId
  if (cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
    if (cleanId.includes('/local/writereview?placeid=')) {
      return cleanId;
    }
    const parsed = parseGoogleMapsUrl(cleanId);
    if (parsed.placeId) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(parsed.placeId)}`;
    }
    if (parsed.cid) {
      return `https://maps.google.com/?cid=${encodeURIComponent(parsed.cid)}`;
    }
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
    stripped = url.slice('http://'.length);
  } else if (url.startsWith('http://')) {
    stripped = url.slice('http://'.length);
  }

  const encoder = new TextEncoder();
  const uriBytes = encoder.encode(stripped).length;
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
    placeId: 'ChIJ58xlIENzXz4RxLmxCxqpjcg', // Exact Product Mate Place ID
    cid: '14451392708632230340',
    name: 'Grill Land Restaurant Co. LLC',
    address: 'Ritaj Community, Dubai Investment Park - 2, Dubai, UAE',
  },
};

/**
 * Extract Place ID, CID, or Place Name from pasted Google Maps URLs.
 * Uses exact Product Mate ftid-to-protobuf conversion.
 */
export function parseGoogleMapsUrl(input: string): ParsedGoogleUrlResult {
  if (!input) return {};
  const trimmed = input.trim();

  // 1. Check known short links
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

  // 2. Check for any 0x...:0x... pattern (ftid or !1s0x...:0x... in Google Maps URLs)
  const ftidMatch = trimmed.match(/0x([0-9a-fA-F]+):0x([0-9a-fA-F]+)/);
  if (ftidMatch && ftidMatch[1] && ftidMatch[2]) {
    const convertedPlaceId = ftidToPlaceId(ftidMatch[1], ftidMatch[2]);
    let cidDecimal = '';
    try {
      cidDecimal = BigInt(`0x${ftidMatch[2]}`).toString();
    } catch {
      // ignore
    }

    let placeName: string | undefined;
    try {
      const parsed = new URL(trimmed);
      const q = parsed.searchParams.get('q');
      if (q) {
        placeName = q.split(',')[0].trim();
      } else if (parsed.pathname.includes('/maps/place/')) {
        const placePart = parsed.pathname.split('/maps/place/')[1];
        if (placePart) {
          placeName = decodeURIComponent(placePart.split('/')[0]).replace(/\+/g, ' ');
        }
      }
    } catch {
      // ignore
    }

    if (convertedPlaceId) {
      return {
        placeId: convertedPlaceId,
        cid: cidDecimal || undefined,
        placeName,
        detectedUrl: trimmed,
      };
    }
  }

  try {
    const parsed = new URL(trimmed);

    // Short links like maps.app.goo.gl or g.page or goo.gl/maps
    if (
      parsed.hostname.includes('maps.app.goo.gl') ||
      parsed.hostname.includes('g.page') ||
      (parsed.hostname.includes('goo.gl') && parsed.pathname.includes('/maps'))
    ) {
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

    // CID format (?cid=...)
    if (parsed.searchParams.has('cid')) {
      return { cid: parsed.searchParams.get('cid') || undefined, detectedUrl: trimmed };
    }

    // ludocid format in google search
    if (parsed.searchParams.has('ludocid')) {
      return { cid: parsed.searchParams.get('ludocid') || undefined, detectedUrl: trimmed };
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
