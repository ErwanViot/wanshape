import { Link, Navigate, useParams } from 'react-router';
import { AlertTriangle, CheckCircle, ChevronLeft, Clock, Lightbulb, Users } from 'lucide-react';
import { getFormatBySlug } from '../data/formats.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { ContentSection } from './ContentSection.tsx';

export function FormatPage() {
  const { slug } = useParams<{ slug: string }>();
  const format = slug ? getFormatBySlug(slug) : undefined;

  useDocumentHead({
    title: format ? `${format.name} — Format d'entraînement` : 'Format',
    description: format
      ? `${format.name} : ${format.shortDescription} Découvrez le principe, le protocole, les bénéfices et les conseils pour ce format d'entraînement sans matériel.`
      : undefined,
  });

  if (!format) {
    return <Navigate to="/formats" replace />;
  }

  return (
    <>
      {/* Hero — text stays white (over image) */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img src={format.image} alt={`Format ${format.name}`} className="w-full h-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />
        </div>

        <Link
          to="/formats"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Retour aux formats"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-black text-white drop-shadow-sm leading-tight">{format.name}</h1>
              <p className="text-sm text-white/60 mt-1">{format.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {format.duration} min
              </span>
              <div className="flex items-center gap-1" aria-label={`Intensité : ${format.intensity} sur 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <p className="text-base text-body leading-relaxed">{format.shortDescription}</p>

        {/* Principe */}
        <ContentSection title="Principe" icon={<Lightbulb className="w-4 h-4 text-brand" aria-hidden="true" />}>
          <p className="text-sm text-subtle leading-relaxed">{format.principle}</p>
        </ContentSection>

        {/* Protocole */}
        <ContentSection title="Comment ça se passe" icon={<Clock className="w-4 h-4 text-brand" aria-hidden="true" />}>
          <p className="text-sm text-subtle leading-relaxed">{format.protocol}</p>
        </ContentSection>

        {/* Bénéfices */}
        <ContentSection title="Bénéfices" icon={<CheckCircle className="w-4 h-4 text-brand" aria-hidden="true" />}>
          <ul className="space-y-2">
            {format.benefits.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-link shrink-0 mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Public cible */}
        <ContentSection title="Pour qui ?" icon={<Users className="w-4 h-4 text-brand" aria-hidden="true" />}>
          <p className="text-sm text-subtle leading-relaxed">{format.targetAudience}</p>
        </ContentSection>

        {/* Conseils */}
        <ContentSection title="Nos conseils" icon={<Lightbulb className="w-4 h-4 text-brand" aria-hidden="true" />}>
          <ul className="space-y-2">
            {format.tips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Erreurs courantes */}
        <ContentSection title="Erreurs courantes" icon={<AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />}>
          <ul className="space-y-2">
            {format.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Cross-links */}
        <div className="pt-4 border-t border-divider space-y-3">
          <div className="flex flex-wrap gap-3">
            <Link to="/exercices" className="text-sm text-link hover:text-link-hover transition-colors">
              Nos exercices →
            </Link>
            <Link to="/programmes" className="text-sm text-link hover:text-link-hover transition-colors">
              Nos programmes →
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <Link to="/formats" className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Tous les formats
            </Link>
            <Link to="/" className="text-sm text-link hover:text-link-hover transition-colors">
              Séance du jour →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
