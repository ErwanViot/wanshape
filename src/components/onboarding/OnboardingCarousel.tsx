import { ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Slide {
  key: string;
  image: string;
  // Decorative slides keep alt="" so screen readers skip them.
  // Informational slides (e.g. an actual product screenshot) read
  // their alt from the i18n catalogue at `slides.<key>.image_alt`.
  decorative: boolean;
}

const SLIDES: Slide[] = [
  { key: 'pitch', image: '/images/illustration-onboarding.webp', decorative: true },
  { key: 'sessions', image: '/images/screenshot-player-hiit.webp', decorative: false },
  { key: 'nutrition', image: '/images/illustration-empty-state.webp', decorative: true },
  { key: 'philosophy', image: '/images/illustration-program.webp', decorative: true },
];

interface Props {
  onComplete: () => void;
  onLogin: () => void;
  onExplore: () => void;
}

// Native first-launch onboarding. Four screens, swipe horizontal via
// CSS scroll-snap (no lib), dot indicators reflect the active slide.
// Plain "Suivant" / "Next" button on slides 0–2; the last slide swaps
// in two CTAs (sign up / explore) and a tertiary skip in the header
// stays available throughout.
export function OnboardingCarousel({ onComplete, onLogin, onExplore }: Props) {
  const { t } = useTranslation('onboarding');
  const scrollerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update the active dot from scroll position. snap-mandatory keeps the
  // index integer-aligned, so dividing by the slide width is safe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        setActiveIndex(idx);
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollTo(activeIndex + 1);
    }
  };

  const handleLogin = () => {
    onComplete();
    onLogin();
  };

  // Skip and "Explore first" share the same destination by design:
  // both flag onboarding done and drop the user on the public Home.
  const handleExplore = () => {
    onComplete();
    onExplore();
  };
  const handleSkip = handleExplore;

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col">
      {/* Skip in the safe area top — always available */}
      <div className="pt-safe px-safe flex justify-end px-4 py-3">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-medium text-muted hover:text-strong transition-colors px-3 py-1.5"
        >
          {t('skip')}
        </button>
      </div>

      {/* Slides — horizontal scroll-snap */}
      <section
        ref={scrollerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory overscroll-contain"
        style={{ scrollbarWidth: 'none' }}
        aria-roledescription="carousel"
        aria-label={t('aria_carousel')}
      >
        {SLIDES.map((slide) => (
          <section
            key={slide.key}
            className="snap-center shrink-0 w-full h-full flex flex-col items-center justify-center gap-6 px-6"
            aria-label={t(`slides.${slide.key}.title`)}
          >
            <img
              src={slide.image}
              alt={slide.decorative ? '' : t(`slides.${slide.key}.image_alt`)}
              className="w-full max-w-md max-h-[55vh] object-contain"
            />
            <div className="flex flex-col items-center gap-3 max-w-sm text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-heading leading-tight">
                {t(`slides.${slide.key}.title`)}
              </h2>
              <p className="text-base text-body leading-relaxed">{t(`slides.${slide.key}.subtitle`)}</p>
            </div>
          </section>
        ))}
      </section>

      {/* Dots — visual indicator stays at h-2 (8 px) but the
          touch target wrapper meets the 44pt iOS / 48dp Android
          minimum hit-zone (relative + py-3 px-1 with a min-w). */}
      <div className="flex justify-center gap-1 py-2">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => scrollTo(idx)}
            aria-label={t('aria_goto_slide', { index: idx + 1 })}
            aria-current={idx === activeIndex ? 'true' : undefined}
            className="relative inline-flex items-center justify-center min-h-[44px] px-2 py-3 cursor-pointer"
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                idx === activeIndex ? 'w-8 bg-brand' : 'w-2 bg-divider-strong'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Footer CTAs */}
      <div className="pb-safe px-safe px-6 pb-6 pt-2">
        {isLastSlide ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand text-white font-semibold transition-colors hover:bg-brand/90"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t('cta_signup')}
            </button>
            <button
              type="button"
              onClick={handleExplore}
              className="w-full py-3.5 rounded-2xl border border-divider text-strong font-medium transition-colors hover:bg-surface-card"
            >
              {t('cta_explore')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center gap-1 w-full py-3.5 rounded-2xl bg-brand text-white font-semibold transition-colors hover:bg-brand/90"
          >
            {t('next')}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
