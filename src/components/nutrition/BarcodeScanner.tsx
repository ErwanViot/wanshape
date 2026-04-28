import { ScanLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

type DetectorStatus = 'idle' | 'supported' | 'unsupported' | 'permission_denied' | 'starting' | 'scanning' | 'error';

interface GlobalWithBarcodeDetector {
  BarcodeDetector?: new (options?: {
    formats?: string[];
  }) => {
    detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
  };
}

const SUPPORTED_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

/**
 * Camera-based barcode scanner using the native BarcodeDetector API.
 * Falls back to a manual input when the API is unavailable (iOS Safari).
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
  const mountedRef = useRef(true);
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

  const startCamera = useCallback(async () => {
    const releaseTracks = (s: MediaStream) => {
      for (const track of s.getTracks()) track.stop();
    };
    const g = globalThis as unknown as GlobalWithBarcodeDetector;
    if (!g.BarcodeDetector) {
      setStatus('unsupported');
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      // Unmount-during-await guard: release the stream instead of attaching it
      // to a ref that nothing will stop.
      if (!mountedRef.current) {
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
      if (!mountedRef.current) {
        stopCamera();
        return;
      }
      setStatus('scanning');

      const DetectorCtor = g.BarcodeDetector;
      if (!DetectorCtor) {
        setStatus('unsupported');
        stopCamera();
        return;
      }
      const detector = new DetectorCtor({ formats: SUPPORTED_FORMATS });

      const tick = async () => {
        if (!mountedRef.current || !videoRef.current || !streamRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results.length > 0) {
            const barcode = results[0].rawValue;
            stopCamera();
            if (mountedRef.current) onDetected(barcode);
            return;
          }
        } catch {
          // transient detection errors are expected; keep trying
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      if (!mountedRef.current) return;
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('permission_denied');
      } else {
        setStatus('error');
      }
      stopCamera();
    }
  }, [onDetected, stopCamera]);

  useEffect(() => {
    mountedRef.current = true;
    startCamera();
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Send focus to the manual input when the camera path is unavailable. The
  // `autoFocus` prop only fires on mount, but `status` flips after the async
  // permission/feature-detection result, so we focus imperatively here.
  useEffect(() => {
    if (status === 'unsupported' || status === 'permission_denied' || status === 'error') {
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
          {status === 'scanning' && (
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/80">
              {t('barcode_scanner.frame_hint')}
            </p>
          )}
        </div>
      )}

      {status === 'unsupported' && (
        <div className="rounded-xl bg-surface-card border border-divider p-3 space-y-1">
          <p className="text-sm text-heading font-medium">{t('barcode_scanner.unsupported_title')}</p>
          <p className="text-xs text-body">{t('barcode_scanner.unsupported')}</p>
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
