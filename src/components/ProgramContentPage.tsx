import { Link, Navigate, useParams } from 'react-router';
import { ArrowRight, Calendar, Clock, Repeat, Target, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { PROGRAM_CONTENT } from '../data/programContent.ts';
import { getProgramImage } from '../utils/programImage.ts';

export function ProgramContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const content = slug ? PROGRAM_CONTENT[slug] : undefined;

  useDocumentHead({
    title: content ? `${content.headline} — Programme WAN2FIT` : 'Programme',
    description: content?.intro,
  });

  if (!slug) return <Navigate to="/programmes" replace />;

  // Custom/AI programs have no editorial content — go straight to suivi
  if (!content) return <Navigate to={`/programme/${slug}/suivi`} replace />;

  const image = getProgramImage(slug);
  const ctaTo = user ? `/programme/${slug}/suivi` : '/signup';
  const ctaLabel = user ? 'Commencer le programme' : 'S\u2019inscrire pour commencer';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        <div className="h-56 sm:h-72 md:h-80 overflow-hidden">
          <img src={image} alt={`Programme ${content.headline}`} className="w-full h-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface/20" />
        </div>

        <Link
          to="/programmes"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Retour aux programmes"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white drop-shadow-md">
              {content.headline}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 space-y-10">
        {/* Intro */}
        <p className="text-lg text-body leading-relaxed">{content.intro}</p>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Durée', value: content.duration },
            { icon: Repeat, label: 'Fréquence', value: content.frequency },
            { icon: Clock, label: 'Par séance', value: content.sessionLength },
            { icon: Target, label: 'Public', value: content.audience.split(',')[0].trim() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-card-border bg-surface-card p-4 space-y-2">
              <stat.icon className="w-5 h-5 text-brand" aria-hidden="true" />
              <p className="text-xs text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-bold text-heading">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to={ctaTo}
            className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {!user && (
            <Link
              to={`/programme/${slug}/suivi`}
              className="text-sm text-link hover:text-link-hover transition-colors"
            >
              Déjà inscrit ? Voir mon suivi
            </Link>
          )}
        </div>

        {/* Approach */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">L'approche</h2>
          <p className="text-body leading-relaxed">{content.approach}</p>
        </section>

        {/* Public cible */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">Pour qui ?</h2>
          <p className="text-body leading-relaxed">{content.audience}</p>
        </section>

        {/* Week by week */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-heading">Semaine par semaine</h2>
          <div className="space-y-3">
            {content.weeks.map((week) => (
              <div key={week.week} className="rounded-xl border border-card-border bg-surface-card p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold shrink-0">
                    {week.week}
                  </span>
                  <h3 className="font-bold text-heading">{week.title}</h3>
                </div>
                <p className="text-sm text-body leading-relaxed pl-11">{week.description}</p>
                <div className="flex flex-wrap gap-1.5 pl-11">
                  {week.formats.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-brand/8 text-brand font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">Ce que tu vas gagner</h2>
          <ul className="space-y-2">
            {content.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                <span className="text-body leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tip */}
        <section className="rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-2">
          <h3 className="font-bold text-heading">Conseil</h3>
          <p className="text-sm text-body leading-relaxed">{content.tip}</p>
        </section>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/formats" className="text-sm text-link hover:text-link-hover transition-colors">
            Les formats →
          </Link>
          <Link to="/exercices" className="text-sm text-link hover:text-link-hover transition-colors">
            Nos exercices →
          </Link>
          <Link to="/programmes" className="text-sm text-link hover:text-link-hover transition-colors">
            Tous les programmes →
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-3 pt-4 pb-8">
          <Link
            to={ctaTo}
            className="cta-gradient inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
