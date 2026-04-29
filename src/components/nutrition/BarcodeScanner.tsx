import { ScanLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

type DetectorStatus = 'idle' | 'loading_decoder' | 'starting' | 'scanning' | 'permission_denied' | 'error';

interface DetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
}

type DetectorCtor = new (options?: { formats?: string[] }) => DetectorLike;

interface GlobalWithBarcodeDetector {
  BarcodeDetector?: DetectorCtor;
}

const SUPPORTED_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

// Native BarcodeDetector exists on Chrome desktop/Android and recent Safari
// macOS, but not on iOS Safari, Chrome iOS (= WKWebView), or Firefox. The
// barcode-detector ponyfill (powered by zxing-wasm) fills that gap with a
// drop-in implementation of the same standard API. It's only loaded when the
// native API is missing — on Chrome we keep the lighter native path.
let polyfillCtor: DetectorCtor | null = null;
let polyfillLoading: Promise<DetectorCtor> | null = null;

async function loadPolyfillCtor(): Promise<DetectorCtor> {
  if (polyfillCtor) return polyfillCtor;
  if (!polyfillLoading) {
    polyfillLoading = (async () => {
      const [{ BarcodeDetector, prepareZXingModule }, wasmUrlMod] = await Promise.all([
        import('barcode-detector/ponyfill'),
        import('zxing-wasm/reader/zxing_reader.wasm?url'),
      ]);
      // Self-host the WASM via the Vite asset pipeline (same origin, hashed
      // filename, cached forever). The default jsDelivr URL would require
      // loosening connect-src in the CSP and introduces a third-party runtime
      // dependency we don't want for an offline-capable PWA.
      prepareZXingModule({
        overrides: {
          locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrlMod.default : prefix + path),
        },
      });
      return BarcodeDetector as unknown as DetectorCtor;
    })();
  }
  polyfillCtor = await polyfillLoading;
  return polyfillCtor;
}

/**
 * Camera-based barcode scanner using the standard BarcodeDetector API.
 * Uses the native implementation when available (Chrome desktop/Android),
 * and lazy-loads the barcode-detector ponyfill (zxing-wasm) elsewhere
 * (iOS Safari, Chrome iOS, Firefox).
 *
 * The component releases the camera stream on unmount and when the user
 * closes the scanner. The video stream is NEVER recorded nor uploaded —
 * we only decode locally and forward the decoded string.
 */
export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const { t } = useTranslation('nutrition');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  // Per-mount token. Async code captures the token at start and bails if the
  // current ref has moved on to a newer value — handles React StrictMode's
  // mount → unmount → remount in dev (which would otherwise let two parallel
  // getUserMedia calls collide on the camera and surface as status='error').
  const activeTokenRef = useRef<symbol | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<DetectorStatus>('idle');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (token: symbol) => {
      const isCurrent = () => activeTokenRef.current === token;
      const releaseTracks = (s: MediaStream) => {
        for (const track of s.getTracks()) track.stop();
      };

      // Resolve detector (native sync, ponyfill async). Keep the user
      // informed while the WASM bundle is loading on slower connections.
      let DetectorCtor: DetectorCtor;
      const nativeCtor = (globalThis as unknown as GlobalWithBarcodeDetector).BarcodeDetector;
      if (nativeCtor) {
        DetectorCtor = nativeCtor;
      } else {
        if (isCurrent()) setStatus('loading_decoder');
        try {
          DetectorCtor = await loadPolyfillCtor();
        } catch {
          if (isCurrent()) setStatus('error');
          return;
        }
        if (!isCurrent()) return;
      }

      if (isCurrent()) setStatus('starting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!isCurrent()) {
          releaseTracks(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          releaseTracks(stream);
          streamRef.current = null;
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (!isCurrent()) {
          stopCamera();
          return;
        }
        setStatus('scanning');

        const detector = new DetectorCtor({ formats: SUPPORTED_FORMATS });

        const tick = async () => {
          if (!isCurrent() || !videoRef.current || !streamRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              const barcode = results[0].rawValue;
              stopCamera();
              if (isCurrent()) onDetected(barcode);
              return;
            }
          } catch {
            // transient detection errors are expected; keep trying
          }
          // Re-check after the awaited detect: the cleanup may have run while
          // we were waiting and already cancelled `rafRef`. Without this guard
          // we'd schedule one orphan frame that fires before the inner check.
          if (!isCurrent()) return;
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!isCurrent()) return;
        const name = err instanceof Error ? err.name : '';
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          setStatus('permission_denied');
        } else {
          setStatus('error');
        }
        stopCamera();
      }
    },
    [onDetected, stopCamera],
  );

  useEffect(() => {
    const token = Symbol('barcode-scanner-mount');
    activeTokenRef.current = token;
    startCamera(token);
    return () => {
      if (activeTokenRef.current === token) activeTokenRef.current = null;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Send focus to the manual input when the camera path is unavailable. The
  // `autoFocus` prop only fires on mount, but `status` flips after the async
  // permission/feature-detection result, so we focus imperatively here.
  useEffect(() => {
    if (status === 'permission_denied' || status === 'error') {
      manualInputRef.current?.focus();
    }
  }, [status]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = manualBarcode.replace(/\s+/g, '');
    if (!/^[0-9]{8,14}$/.test(trimmed)) {
      setManualError(t('barcode_scanner.manual_error'));
      return;
    }
    setManualError(null);
    stopCamera();
    onDetected(trimmed);
  }

  // Pre-decoder loading + camera startup share the same skeleton viewport so
  // the layout doesn't reflow when the polyfill resolves. The video element
  // mounts only when we have a stream, so a separate placeholder covers the
  // earlier states.
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-brand" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-heading">{t('barcode_scanner.heading')}</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-xs text-muted hover:text-heading"
        >
          {t('barcode_scanner.close')}
        </button>
      </header>

      {status === 'loading_decoder' && (
        <div className="rounded-xl bg-black/50 aspect-[4/3] flex items-center justify-center">
          <p className="text-xs text-white/80">{t('barcode_scanner.loading_decoder')}</p>
        </div>
      )}

      {/* Mount the video element for both 'starting' and 'scanning' so
          videoRef is attached before startCamera tries to set srcObject.
          The overlay differs per state. */}
      {(status === 'starting' || status === 'scanning') && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            aria-label={t('barcode_scanner.camera_aria')}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-20 border-2 border-brand/80 rounded-lg" />
          </div>
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/80">
            {status === 'scanning' ? t('barcode_scanner.frame_hint') : t('barcode_scanner.starting')}
          </p>
        </div>
      )}

      {status === 'permission_denied' && <p className="text-sm text-body">{t('barcode_scanner.permission_denied')}</p>}
      {status === 'error' && <p className="text-sm text-red-400">{t('barcode_scanner.error')}</p>}

      <form onSubmit={handleManualSubmit} className="space-y-2">
        <label htmlFor="manual-barcode" className="block text-xs font-medium text-body">
          {t('barcode_scanner.manual_label')}
        </label>
        <div className="flex gap-2">
          <input
            ref={manualInputRef}
            id="manual-barcode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder={t('barcode_scanner.manual_placeholder')}
            className="flex-1 px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
          />
          <button type="submit" className="px-4 py-3 rounded-xl text-sm font-bold text-white cta-gradient">
            {t('barcode_scanner.validate')}
          </button>
        </div>
        {manualError && <p className="text-xs text-red-400">{manualError}</p>}
      </form>

      <p className="text-[11px] text-muted italic">{t('barcode_scanner.source_credit')}</p>
    </div>
  );
}
