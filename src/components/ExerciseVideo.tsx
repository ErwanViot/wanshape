import { useRef, useEffect, useState } from 'react';

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-pause when scrolled out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVisible]);

  if (hasError) {
    return <img src={fallbackImage} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <img src={fallbackImage} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      )}
    </div>
  );
}
