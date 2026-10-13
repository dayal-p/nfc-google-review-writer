// Web NFC API integration with strict typing and device detection

export interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: unknown;
  encoding?: string;
  lang?: string;
}

export interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

export interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

export interface NDEFReaderInstance {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(message: NDEFMessageInit | string, options?: NDEFWriteOptions): Promise<void>;
  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;
  onreading?: (event: Event) => void;
  onreadingerror?: (event: Event) => void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

declare global {
  interface Window {
    NDEFReader?: new () => NDEFReaderInstance;
  }
}

export function isWebNfcSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'NDEFReader' in window;
}

export function getDeviceNfcInfo(): {
  isSupported: boolean;
  isAndroid: boolean;
  isIos: boolean;
  isDesktop: boolean;
  isSecure: boolean;
  message: string;
} {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      isAndroid: false,
      isIos: false,
      isDesktop: false,
      isSecure: false,
      message: 'Server environment',
    };
  }

  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isDesktop = !isAndroid && !isIos;
  const isSecure = window.isSecureContext;
  const isSupported = isWebNfcSupported();

  let message = '';
  if (isSupported) {
    message = 'Web NFC is supported and ready on this browser!';
  } else if (isIos) {
    message = 'Web NFC writing is not exposed by iOS Safari. Apple reserves NFC writing for native apps. Use the live QR code or copy the link into the free "NFC Tools" app on iOS.';
  } else if (isAndroid) {
    message = 'Web NFC is supported in Google Chrome on Android. Please open this page in Chrome and ensure NFC is turned on in your device settings.';
  } else {
    message = 'Web NFC is not supported on desktop browsers. Open this page on Android Chrome to write directly, or use the QR code / NFC Tools app.';
  }

  return {
    isSupported,
    isAndroid,
    isIos,
    isDesktop,
    isSecure,
    message,
  };
}

export interface NfcWriteResult {
  success: boolean;
  locked?: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Write a URL record to an NFC tag using the Web NFC API.
 * Optionally locks the tag permanently as read-only.
 */
export async function writeUrlToNfc(
  url: string,
  options: {
    lockTag?: boolean;
    signal?: AbortSignal;
    onStatusChange?: (status: 'ready' | 'writing' | 'locking' | 'done') => void;
  } = {}
): Promise<NfcWriteResult> {
  if (!isWebNfcSupported() || !window.NDEFReader) {
    throw new Error('Web NFC (NDEFReader) is not supported in this browser.');
  }

  if (!url) {
    throw new Error('Target URL cannot be empty.');
  }

  const ndef = new window.NDEFReader();

  try {
    options.onStatusChange?.('ready');

    // NDEF URI record payload
    const message: NDEFMessageInit = {
      records: [
        {
          recordType: 'url',
          data: url,
        },
      ],
    };

    options.onStatusChange?.('writing');
    await ndef.write(message, {
      signal: options.signal,
      overwrite: true,
    });

    let wasLocked = false;
    if (options.lockTag && typeof ndef.makeReadOnly === 'function') {
      options.onStatusChange?.('locking');
      await ndef.makeReadOnly({ signal: options.signal });
      wasLocked = true;
    }

    options.onStatusChange?.('done');
    return {
      success: true,
      locked: wasLocked,
    };
  } catch (err: unknown) {
    const error = err as Error;
    let userFriendlyMessage = error.message || 'An unknown error occurred while writing to NFC.';
    let code = error.name || 'UnknownError';

    if (error.name === 'NotAllowedError') {
      userFriendlyMessage = 'NFC permission denied. Please allow NFC access when prompted and verify NFC is turned ON in phone settings.';
    } else if (error.name === 'NotSupportedError') {
      userFriendlyMessage = 'This tag is not supported or Web NFC is disabled on this device.';
    } else if (error.name === 'NotReadableError') {
      userFriendlyMessage = 'Could not communicate with NFC tag. Hold your phone firmly against the card until complete.';
    } else if (error.name === 'SecurityError') {
      userFriendlyMessage = 'Web NFC requires a secure HTTPS connection or localhost.';
    } else if (error.name === 'AbortError') {
      userFriendlyMessage = 'Operation was cancelled or timed out.';
    } else if (error.name === 'InvalidStateError') {
      userFriendlyMessage = 'The NFC tag is locked (read-only) and cannot be overwritten.';
    }

    return {
      success: false,
      error: userFriendlyMessage,
      errorCode: code,
    };
  }
}
