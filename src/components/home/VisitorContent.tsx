import { Link } from 'react-router';
import {
  Zap,
  Calendar,
  ArrowRight,
  Play,
  Target,
  Dumbbell,
  Clock,
  RotateCcw,
  Shuffle,
  TrendingUp,
  Wand2,
  ListChecks,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase.ts';
import type { Session } from '../../types/session.ts';
import { computeDifficulty } from '../../utils/sessionDifficulty.ts';
import { getSessionImage } from '../../utils/sessionImage.ts';
import { ScreenshotCarousel } from '../ScreenshotCarousel.tsx';
import { SessionAccordion } from '../SessionAccordion.tsx';
import { TomorrowCard } from './TomorrowCard.tsx';

export function VisitorContent({
  session,
  loading,
  tomorrowSession,
  tomorrowLoading,
  tomorrowKey,
  onStart,
  formatShortDate,
}: {
  session: Session | null;
  loading: boolean;
  tomorrowSession: Session | null;
  tomorrowLoading: boolean;
  tomorrowKey: string;
  onStart: () => void;
  formatShortDate: (key: string) => string;
}) {
  return (
    <div className="space-y-0">
      {/* ── 1. Hero — photo pleine largeur ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-landing-couple.webp"
            alt=""
            className="w-full h-full object-cover object-[65%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15 md:from-black/80 md:via-black/50 md:to-black/30" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 lg:px-14">
          <div className="max-w-5xl mx-auto py-16 md:py-24 space-y-6">
            <div className="stagger-fade-in stagger-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Zap className="w-3 h-3" aria-hidden="true" />
                Sans matériel, où tu veux
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] max-w-xl stagger-fade-in stagger-2">
              <span className="text-outline">Progresse</span>
              <br />
              <span className="gradient-text">à ton rythme</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed text-outline stagger-fade-in stagger-3">
              Une séance guidée chaque jour, 8 formats variés, 25-40 min. Gratuit pour commencer, premium pour aller plus loin.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 stagger-fade-in stagger-4">
              {supabase && (
                <Link
                  to="/signup"
                  className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                onClick={onStart}
                className="px-8 py-4 rounded-full text-base font-bold text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Essayer sans inscription
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Comment ça marche — 3 étapes ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-black text-heading text-center mb-12">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 text-center">

            {[
              { step: '1', icon: Calendar, title: 'Choisis ta séance', desc: 'Séance du jour, format libre ou programme : c\'est toi qui décides.' },
              { step: '2', icon: Play, title: 'Lance-toi', desc: 'Exercices guidés, chrono intégré, transitions automatiques.' },
              { step: '3', icon: TrendingUp, title: 'Suis ta progression', desc: 'Historique, stats et programmes pour aller toujours plus loin.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center shadow-lg shadow-brand/10">
                    <item.icon className="w-8 h-8 text-brand" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand-secondary text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-heading">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Feature : Séance du jour ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-5">
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Séance du jour</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Chaque jour,<br />une nouvelle séance
              </h2>
              <p className="text-muted leading-relaxed">
                Pas besoin de réfléchir. Tu ouvres l'app, ta séance t'attend — avec un format différent chaque jour.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Shuffle, text: '8 formats variés : HIIT, EMOM, Circuit, Tabata…' },
                  { icon: Clock, text: '25 à 40 min, adapté à ton emploi du temps' },
                  { icon: Dumbbell, text: '100% sans matériel, faisable partout' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors cursor-pointer"
              >
                Essayer maintenant
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visuel : preview séance du jour + demain */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-card-border">
                {loading ? (
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-40 rounded-xl" />
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-10 w-full rounded-xl" />
                  </div>
                ) : session ? (
                  <>
                    <button type="button" onClick={onStart} className="relative h-44 w-full cursor-pointer text-left">
                      <img src={getSessionImage(session)} alt={`Séance du jour : ${session.title}`} className="w-full h-full object-cover object-[50%_30%]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-4">
                        <span className="session-label px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest uppercase text-white">
                          Aujourd'hui
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="font-display text-xl font-bold text-white leading-tight">
                          {session.title.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/70">~{session.estimatedDuration} min</span>
                          {session.focus.slice(0, 2).map((f) => (
                            <span key={f} className="text-xs text-white/70">· {f}</span>
                          ))}
                          {(() => {
                            const difficulty = computeDifficulty(session);
                            return (
                              <>
                                <span className="text-xs text-white/70">·</span>
                                <span
                                  className={`text-xs font-semibold ${
                                    difficulty.level === 'accessible'
                                      ? 'text-emerald-300'
                                      : difficulty.level === 'modere'
                                        ? 'text-amber-300'
                                        : 'text-red-300'
                                  }`}
                                >
                                  {difficulty.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </button>
                    <div className="px-5 py-4 bg-surface-card space-y-3">
                      {session.description && (
                        <p className="text-sm text-muted leading-relaxed">{session.description}</p>
                      )}
                      <button
                        type="button"
                        onClick={onStart}
                        className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                      >
                        <Play className="w-4 h-4" aria-hidden="true" />
                        C'est parti
                      </button>
                    </div>
                    <SessionAccordion session={session} />
                  </>
                ) : (
                  <div className="p-8 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <img src="/images/illustration-empty-state.webp" alt="Pas de séance prévue" className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80" />
                      <p className="text-sm text-muted">Pas de séance aujourd'hui</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Séance de demain */}
              {!tomorrowLoading && tomorrowSession && (
                <TomorrowCard session={tomorrowSession} dateKey={tomorrowKey} formatShortDate={formatShortDate} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Feature : Le player ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte (à droite en desktop) */}
            <div className="space-y-5 order-1 md:order-2">
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Entraînement guidé</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Tu n'as qu'à<br />suivre le rythme
              </h2>
              <p className="text-muted leading-relaxed">
                Chrono, compteur de reps, transitions automatiques — le player gère tout pour que tu restes concentré sur l'effort.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Play, text: 'Timer et reps guidés en temps réel' },
                  { icon: Shuffle, text: 'Enchaînement automatique des blocs' },
                  { icon: Zap, text: 'Signal sonore à chaque transition' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors cursor-pointer"
              >
                Lancer une séance
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visuel : carrousel player (à gauche en desktop) */}
            <ScreenshotCarousel
              images={[
                { src: '/images/screenshot-player-reps.webp', alt: 'Player — exercice en reps' },
                { src: '/images/screenshot-player-emom.webp', alt: 'Player — EMOM avec timer' },
                { src: '/images/screenshot-player-hiit.webp', alt: 'Player — HIIT Mountain climbers' },
                { src: '/images/screenshot-player-cooldown.webp', alt: 'Player — Retour au calme' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 5. Feature : IA sur-mesure (Premium) ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-accent">IA sur-mesure</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Des séances créées<br />rien que pour toi
              </h2>
              <p className="text-muted leading-relaxed">
                L'intelligence artificielle génère des séances et des programmes adaptés à tes envies, ton niveau et tes objectifs.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Wand2, text: 'Séances personnalisées en quelques secondes' },
                  { icon: TrendingUp, text: 'Programmes sur-mesure avec progression intégrée' },
                  { icon: RotateCcw, text: 'S\'adapte à tes retours et ta forme du moment' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/tarifs"
                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
              >
                Découvrir Premium
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Visuel : carrousel 3 modes de création */}
            <ScreenshotCarousel
              fit="contain"
              images={[
                { src: '/images/screenshot-custom-session.webp', alt: 'Créer une séance — Mode Rapide' },
                { src: '/images/screenshot-custom-detailed.webp', alt: 'Créer une séance — Mode Détaillé' },
                { src: '/images/screenshot-custom-expert.webp', alt: 'Créer une séance — Mode Expert' },
                { src: '/images/screenshot-custom-detail.webp', alt: 'Détail d\'une séance personnalisée' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 6. Feature : Programmes guidés ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte (à droite en desktop) */}
            <div className="space-y-5 order-1 md:order-2">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-secondary">Programmes guidés</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Un plan structuré<br />pour progresser
              </h2>
              <p className="text-muted leading-relaxed">
                Suis un programme complet avec progression intégrée, suivi détaillé et séances adaptées à chaque étape.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: ListChecks, text: '3 programmes inclus pour bien démarrer' },
                  { icon: Target, text: 'Suivi de complétion et objectifs clairs' },
                  { icon: Wand2, text: 'Des programmes sur mesure pour atteindre tes objectifs', premium: true },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">
                      {item.text}
                      {'premium' in item && item.premium && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full align-middle">Premium</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-secondary hover:text-brand-secondary/80 transition-colors"
              >
                Voir les programmes
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Visuel : carrousel programmes (à gauche en desktop) */}
            <div className="order-2 md:order-1">
              <ScreenshotCarousel
              fit="contain"
              images={[
                { src: '/images/screenshot-program-list.webp', alt: 'Liste des programmes disponibles' },
                { src: '/images/screenshot-program-objectif.webp', alt: 'Création de programme — Objectif' },
                { src: '/images/screenshot-program-profil.webp', alt: 'Création de programme — Profil' },
                { src: '/images/screenshot-program-config.webp', alt: 'Création de programme — Configuration' },
              ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. À propos — encart discret ── */}
      <section className="px-6 md:px-10 lg:px-14 pt-12 pb-0">
        <div className="max-w-md mx-auto">
          <Link
            to="/a-propos"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-card-border hover:border-divider-strong bg-surface-card/50 hover:bg-surface-card transition-all group"
          >
            <img
              src="/photo-wan.png"
              alt="Wan"
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-body group-hover:text-heading transition-colors">
                Pourquoi Wan2Fit ?
              </p>
              <p className="text-xs text-muted truncate">
                L'histoire derrière le projet — par Wan
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-subtle transition-colors shrink-0 ml-auto" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── 8. CTA final ── */}
      <section className="px-6 md:px-10 lg:px-14 pt-10 pb-16 md:pt-12 md:pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-black text-heading">
            Prêt à commencer ?
          </h2>
          <p className="text-muted">
            Ta séance quotidienne t'attend — rejoins Wan2Fit et commence dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {supabase && (
              <Link
                to="/signup"
                className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white"
              >
                Créer mon compte gratuit
              </Link>
            )}
            <Link
              to="/decouvrir"
              className="text-sm text-link hover:text-link-hover transition-colors flex items-center gap-1"
            >
              Découvrir les formats
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
