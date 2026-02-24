import { useRef, useEffect, useState, useCallback } from 'react';

interface ExerciseVideoProps {
  src: string;
  fallbackImage: string;
  alt?: string;
  className?: string;
}

export function ExerciseVideo({ src, fallbackImage, alt = '', className = '' }: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleError = useCallback(() => setHasError(true), []);

  // Single observer: lazy-load on first intersection, then play/pause on visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let loaded = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!loaded && entry.isIntersecting) {
          loaded = true;
          setIsVisible(true);
        }
        // Play/pause after video is loaded
        if (loaded) {
          const video = videoRef.current;
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: '200px', threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (hasError) {
    return <img src={fallbackImage} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <div ref={containerRef} className={className} role="img" aria-label={alt}>
      {isVisible ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" onError={handleError} />
        </video>
      ) : (
        <img src={fallbackImage} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      )}
    </div>
  );
}
