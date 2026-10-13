export interface BusinessProfile {
  name: string;
  placeId: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  cid?: string;
  category?: string;
  verified: boolean;
  reviewUrl: string;
  alternateUrl?: string;
  searchIntentUrl?: string;
}

export type PlatformType = 'google' | 'trustpilot' | 'yelp' | 'tripadvisor' | 'custom';

export interface CustomProfile {
  name: string;
  url: string;
  platform: PlatformType;
  intentSlug?: string;
}

export type ModeType = 'places' | 'custom';

export type CardFinish = 'matte-black' | 'matte-white' | 'brushed-gold' | 'midnight-blue';

export type NfcWriteState = 'idle' | 'ready' | 'writing' | 'success' | 'error';

export interface NfcTagSpec {
  name: string;
  totalMemory: number; // total bytes
  userMemory: number;  // usable payload bytes
  maxUrlLength: number;
}

export const NFC_TAG_SPECS: Record<'NTAG213' | 'NTAG215' | 'NTAG216', NfcTagSpec> = {
  NTAG213: {
    name: 'NTAG213',
    totalMemory: 180,
    userMemory: 144,
    maxUrlLength: 132, // accounting for NDEF URI record headers
  },
  NTAG215: {
    name: 'NTAG215',
    totalMemory: 540,
    userMemory: 504,
    maxUrlLength: 492,
  },
  NTAG216: {
    name: 'NTAG216',
    totalMemory: 924,
    userMemory: 888,
    maxUrlLength: 876,
  },
};

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
