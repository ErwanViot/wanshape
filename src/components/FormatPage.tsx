import { Link, useParams, Navigate } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { getFormatBySlug } from '../data/formats.ts';

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
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img src={format.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />
        </div>

        <Link
          to="/formats"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Retour aux formats"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm leading-tight">{format.name}</h1>
              <p className="text-sm text-white/60 mt-1">{format.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {format.duration} min
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <p className="text-base text-white/60 leading-relaxed">
          {format.shortDescription}
        </p>

        {/* Principe */}
        <ContentSection title="Principe" icon="💡">
          <p className="text-sm text-white/50 leading-relaxed">{format.principle}</p>
        </ContentSection>

        {/* Protocole */}
        <ContentSection title="Comment ça se passe" icon="⏱️">
          <p className="text-sm text-white/50 leading-relaxed">{format.protocol}</p>
        </ContentSection>

        {/* Bénéfices */}
        <ContentSection title="Bénéfices" icon="✅">
          <ul className="space-y-2">
            {format.benefits.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Public cible */}
        <ContentSection title="Pour qui ?" icon="🎯">
          <p className="text-sm text-white/50 leading-relaxed">{format.targetAudience}</p>
        </ContentSection>

        {/* Conseils */}
        <ContentSection title="Nos conseils" icon="💬">
          <ul className="space-y-2">
            {format.tips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Erreurs courantes */}
        <ContentSection title="Erreurs courantes" icon="⚠️">
          <ul className="space-y-2">
            {format.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Navigation */}
        <div className="pt-4 border-t border-white/8 flex items-center justify-between">
          <Link
            to="/formats"
            className="text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Tous les formats
          </Link>
          <Link
            to="/"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Séance du jour →
          </Link>
        </div>
      </main>
    </div>
  );
}

function ContentSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
