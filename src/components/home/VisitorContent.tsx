import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  ListChecks,
  Play,
  RotateCcw,
  Shuffle,
  Target,
  TrendingUp,
  Wand2,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase.ts';
import type { Session } from '../../types/session.ts';
import { getSessionImage } from '../../utils/sessionImage.ts';
import { DifficultyBadge } from '../DifficultyBadge.tsx';
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
  const { t } = useTranslation('home');

  return (
    <div className="space-y-0">
      {/* ── 1. Hero — photo pleine largeur ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-landing-couple.webp"
            alt=""
            width={1920}
            height={814}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[65%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15 md:from-black/80 md:via-black/50 md:to-black/30" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 lg:px-14">
          <div className="max-w-5xl mx-auto py-16 md:py-24 space-y-6">
            <div className="stagger-fade-in stagger-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Zap className="w-3 h-3" aria-hidden="true" />
                {t('visitor.hero.badge')}
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] max-w-xl stagger-fade-in stagger-2">
              <span className="text-outline">{t('visitor.hero.headline_1')}</span>
              <br />
              <span className="gradient-text">{t('visitor.hero.headline_2')}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed text-outline stagger-fade-in stagger-3">
              {t('visitor.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 stagger-fade-in stagger-4">
              {supabase && (
                <Link
                  to="/signup"
                  className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2"
                >
                  {t('visitor.hero.cta_signup')}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                onClick={onStart}
                className="px-8 py-4 rounded-full text-base font-bold text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {t('visitor.hero.cta_try')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Comment ça marche — 3 étapes ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-black text-heading text-center mb-12">
            {t('visitor.how_it_works.heading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 text-center">
            {[
              {
                step: '1',
                icon: Calendar,
                title: t('visitor.how_it_works.step_1_title'),
                desc: t('visitor.how_it_works.step_1_desc'),
              },
              {
                step: '2',
                icon: Play,
                title: t('visitor.how_it_works.step_2_title'),
                desc: t('visitor.how_it_works.step_2_desc'),
              },
              {
                step: '3',
                icon: TrendingUp,
                title: t('visitor.how_it_works.step_3_title'),
                desc: t('visitor.how_it_works.step_3_desc'),
              },
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
              <span className="text-xs font-bold tracking-widest uppercase text-brand">
                {t('visitor.feature_today.label')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                {t('visitor.feature_today.heading_1')}
                <br />
                {t('visitor.feature_today.heading_2')}
              </h2>
              <p className="text-muted leading-relaxed">{t('visitor.feature_today.body')}</p>
              <ul className="space-y-3">
                {[
                  { icon: Shuffle, text: t('visitor.feature_today.bullet_1') },
                  { icon: Clock, text: t('visitor.feature_today.bullet_2') },
                  { icon: Dumbbell, text: t('visitor.feature_today.bullet_3') },
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
                {t('visitor.feature_today.cta')}
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
                      <img
                        src={getSessionImage(session)}
                        alt={t('visitor.feature_today.session_alt', { title: session.title })}
                        className="w-full h-full object-cover object-[50%_30%]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-4">
                        <span className="session-label px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest uppercase text-white">
                          {t('visitor.feature_today.today_label')}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="font-display text-xl font-bold text-white leading-tight">
                          {session.title.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/70">
                            {t('visitor.feature_today.duration', { duration: session.estimatedDuration })}
                          </span>
                          {session.focus.slice(0, 2).map((f) => (
                            <span key={f} className="text-xs text-white/70">
                              · {f}
                            </span>
                          ))}
                          <DifficultyBadge session={session} />
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
                        {t('visitor.feature_today.play_cta')}
                      </button>
                    </div>
                    <SessionAccordion session={session} />
                  </>
                ) : (
                  <div className="p-8 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <img
                        src="/images/illustration-empty-state.webp"
                        alt={t('visitor.feature_today.empty_alt')}
                        className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80"
                      />
                      <p className="text-sm text-muted">{t('visitor.feature_today.empty')}</p>
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
              <span className="text-xs font-bold tracking-widest uppercase text-brand">
                {t('visitor.feature_player.label')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                {t('visitor.feature_player.heading_1')}
                <br />
                {t('visitor.feature_player.heading_2')}
              </h2>
              <p className="text-muted leading-relaxed">{t('visitor.feature_player.body')}</p>
              <ul className="space-y-3">
                {[
                  { icon: Play, text: t('visitor.feature_player.bullet_1') },
                  { icon: Shuffle, text: t('visitor.feature_player.bullet_2') },
                  { icon: Zap, text: t('visitor.feature_player.bullet_3') },
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
                {t('visitor.feature_player.cta')}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visuel : carrousel player (à gauche en desktop) */}
            <ScreenshotCarousel
              images={[
                { src: '/images/screenshot-player-reps.webp', alt: t('visitor.feature_player.carousel_reps_alt') },
                { src: '/images/screenshot-player-emom.webp', alt: t('visitor.feature_player.carousel_emom_alt') },
                { src: '/images/screenshot-player-hiit.webp', alt: t('visitor.feature_player.carousel_hiit_alt') },
                {
                  src: '/images/screenshot-player-cooldown.webp',
                  alt: t('visitor.feature_player.carousel_cooldown_alt'),
                },
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
                <span className="text-xs font-bold tracking-widest uppercase text-accent">
                  {t('visitor.feature_ai.label')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">
                  {t('visitor.feature_ai.badge')}
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                {t('visitor.feature_ai.heading_1')}
                <br />
                {t('visitor.feature_ai.heading_2')}
              </h2>
              <p className="text-muted leading-relaxed">{t('visitor.feature_ai.body')}</p>
              <ul className="space-y-3">
                {[
                  { icon: Wand2, text: t('visitor.feature_ai.bullet_1') },
                  { icon: TrendingUp, text: t('visitor.feature_ai.bullet_2') },
                  { icon: RotateCcw, text: t('visitor.feature_ai.bullet_3') },
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
                {t('visitor.feature_ai.cta')}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Visuel : carrousel 3 modes de création */}
            <ScreenshotCarousel
              fit="contain"
              images={[
                { src: '/images/screenshot-custom-session.webp', alt: t('visitor.feature_ai.carousel_quick_alt') },
                { src: '/images/screenshot-custom-detailed.webp', alt: t('visitor.feature_ai.carousel_detailed_alt') },
                { src: '/images/screenshot-custom-expert.webp', alt: t('visitor.feature_ai.carousel_expert_alt') },
                { src: '/images/screenshot-custom-detail.webp', alt: t('visitor.feature_ai.carousel_detail_alt') },
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
              <span className="text-xs font-bold tracking-widest uppercase text-brand-secondary">
                {t('visitor.feature_programs.label')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                {t('visitor.feature_programs.heading_1')}
                <br />
                {t('visitor.feature_programs.heading_2')}
              </h2>
              <p className="text-muted leading-relaxed">{t('visitor.feature_programs.body')}</p>
              <ul className="space-y-3">
                {[
                  { icon: ListChecks, text: t('visitor.feature_programs.bullet_1') },
                  { icon: Target, text: t('visitor.feature_programs.bullet_2') },
                  { icon: Wand2, text: t('visitor.feature_programs.bullet_3'), premium: true },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">
                      {item.text}
                      {'premium' in item && item.premium && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full align-middle">
                          Premium
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-secondary hover:text-brand-secondary/80 transition-colors"
              >
                {t('visitor.feature_programs.cta')}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Visuel : carrousel programmes (à gauche en desktop) */}
            <div className="order-2 md:order-1">
              <ScreenshotCarousel
                fit="contain"
                images={[
                  {
                    src: '/images/screenshot-program-list.webp',
                    alt: t('visitor.feature_programs.carousel_list_alt'),
                  },
                  {
                    src: '/images/screenshot-program-objectif.webp',
                    alt: t('visitor.feature_programs.carousel_goal_alt'),
                  },
                  {
                    src: '/images/screenshot-program-profil.webp',
                    alt: t('visitor.feature_programs.carousel_profile_alt'),
                  },
                  {
                    src: '/images/screenshot-program-config.webp',
                    alt: t('visitor.feature_programs.carousel_config_alt'),
                  },
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
              src="/photo-wan.webp"
              alt={t('visitor.about_teaser.photo_alt')}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-body group-hover:text-heading transition-colors">
                {t('visitor.about_teaser.question')}
              </p>
              <p className="text-xs text-muted truncate">{t('visitor.about_teaser.subtitle')}</p>
            </div>
            <ChevronRight
              className="w-4 h-4 text-muted group-hover:text-subtle transition-colors shrink-0 ml-auto"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* ── 8. CTA final ── */}
      <section className="px-6 md:px-10 lg:px-14 pt-10 pb-16 md:pt-12 md:pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-black text-heading">
            {t('visitor.cta_section.heading')}
          </h2>
          <p className="text-muted">{t('visitor.cta_section.body')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {supabase && (
              <Link to="/signup" className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white">
                {t('visitor.cta_section.signup')}
              </Link>
            )}
            <Link
              to="/decouvrir"
              className="text-sm text-link hover:text-link-hover transition-colors flex items-center gap-1"
            >
              {t('visitor.cta_section.explore')}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
