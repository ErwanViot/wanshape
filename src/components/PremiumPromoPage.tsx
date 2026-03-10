import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Sparkles,
  Crown,
  Wand2,
  TrendingUp,
  RotateCcw,
  Target,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useSubscription } from '../hooks/useSubscription.ts';
import { PricingCards } from './PricingCards.tsx';

/* ────────────────────────────────────────────
   Screenshot Carousel (repris de Home)
   ──────────────────────────────────────────── */

function ScreenshotCarousel({ images, fit = 'contain', interval = 4000 }: { images: { src: string; alt: string }[]; fit?: 'cover' | 'contain'; interval?: number }) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval, images.length]);

  return (
    <div className="relative w-full">
      <div className="relative aspect-[4/5] max-h-[420px] mx-auto overflow-hidden rounded-2xl border border-card-border shadow-2xl">
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
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === active ? 'bg-accent' : 'bg-muted/30'}`}
              aria-label={img.alt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Premium Promo Page
   ──────────────────────────────────────────── */

export function PremiumPromoPage() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  useDocumentHead({
    title: 'Premium',
    description: 'Passe à Premium : séances IA sur-mesure et programmes personnalisés pour atteindre tes objectifs.',
  });

  return (
    <div className="space-y-0">
      {/* ── 1. Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-brand/5" />
        <div className="relative z-10 px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <Crown className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold text-accent">Premium</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-heading leading-[1.1]">
              L'IA qui s'adapte<br />
              <span className="bg-gradient-to-r from-accent to-brand bg-clip-text text-transparent">à tes objectifs</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              Des séances et des programmes créés sur-mesure par intelligence artificielle, adaptés à ton niveau, tes envies et ta progression.
            </p>

            {!user && (
              <div className="pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-accent hover:bg-accent/90 transition-colors"
                >
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  Créer un compte
                </Link>
              </div>
            )}

            {!isPremium && user && (
              <p className="text-sm text-muted">
                <a href="#tarifs" className="text-accent font-semibold hover:text-accent/80 transition-colors">
                  Voir les tarifs <ArrowRight className="w-3.5 h-3.5 inline" aria-hidden="true" />
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. Séances IA sur-mesure ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <ScreenshotCarousel
                images={[
                  { src: '/images/screenshot-custom-session.webp', alt: 'Créer une séance — Mode Rapide' },
                  { src: '/images/screenshot-custom-detailed.webp', alt: 'Créer une séance — Mode Détaillé' },
                  { src: '/images/screenshot-custom-expert.webp', alt: 'Créer une séance — Mode Expert' },
                ]}
              />
            </div>

            <div className="space-y-5 order-1 md:order-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-accent">Séances IA</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Des séances créées<br />rien que pour toi
              </h2>
              <p className="text-muted leading-relaxed">
                Choisis tes muscles cibles, ton format préféré, ta durée — l'IA construit une séance complète en quelques secondes.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Wand2, text: '3 modes de création : rapide, détaillé ou expert' },
                  { icon: RotateCcw, text: 'Régénère autant de fois que tu veux' },
                  { icon: Target, text: 'Adapté à ton niveau et tes objectifs' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Programmes IA personnalisés ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-accent">Programmes IA</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Un programme complet<br />en quelques clics
              </h2>
              <p className="text-muted leading-relaxed">
                Définis ton objectif, ton niveau et tes disponibilités — l'IA génère un programme structuré sur plusieurs semaines avec progression intégrée.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: ListChecks, text: 'Calendrier structuré semaine par semaine' },
                  { icon: TrendingUp, text: 'Progression et deload intégrés automatiquement' },
                  { icon: Target, text: 'Suivi de complétion et objectifs clairs' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ScreenshotCarousel
              images={[
                { src: '/images/screenshot-program-objectif.webp', alt: 'Création de programme — Objectif' },
                { src: '/images/screenshot-program-profil.webp', alt: 'Création de programme — Profil' },
                { src: '/images/screenshot-program-config.webp', alt: 'Création de programme — Configuration' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 4. Tarifs ── */}
      <section id="tarifs" className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-black text-heading text-center mb-10">
            Choisis ton plan
          </h2>
          <PricingCards />
        </div>
      </section>
    </div>
  );
}
