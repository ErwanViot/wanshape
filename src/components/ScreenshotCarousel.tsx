import { useCallback, useEffect, useRef, useState } from 'react';

export function ScreenshotCarousel({
  images,
  ratio = 'portrait',
  maxHeight,
  fit = 'cover',
  interval = 4000,
  dotColor = 'brand',
}: {
  images: { src: string; alt: string }[];
  ratio?: 'portrait' | 'landscape';
  maxHeight?: string;
  fit?: 'cover' | 'contain';
  interval?: number;
  dotColor?: 'brand' | 'accent';
}) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length <= 1 || !isVisible) return;
    const id = window.setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval, images.length, isVisible]);

  const aspectClass = ratio === 'portrait' ? 'aspect-[4/5]' : 'aspect-[5/3]';
  const maxHClass = maxHeight ?? (ratio === 'portrait' ? 'max-h-[480px]' : '');
  const activeDotClass = dotColor === 'accent' ? 'bg-accent' : 'bg-brand';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`relative ${aspectClass} ${maxHClass} mx-auto overflow-hidden rounded-2xl border border-card-border shadow-2xl`}>
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${fit === 'contain' ? 'object-contain' : 'object-cover object-top'} ${i === active ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === active ? activeDotClass : 'bg-muted/30'}`}
              aria-label={`Aller au slide ${i + 1} sur ${images.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
