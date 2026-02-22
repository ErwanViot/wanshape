import { Link } from 'react-router';
import { getTodayKey, parseDDMMYYYY } from '../utils/date.ts';
import { useSession } from '../hooks/useSession.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { computeTimeline } from '../utils/sessionTimeline.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { SessionRecap } from './SessionRecap.tsx';
import type { Session } from '../types/session.ts';

function formatShortDate(dateKey: string): string {
  const d = parseDDMMYYYY(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const FORMATS_COMPACT = [
  { name: 'Pyramide', slug: 'pyramide', duration: '30-38', desc: 'Séries croissantes puis décroissantes', intensity: 1 },
  { name: 'Renforcement', slug: 'renforcement', duration: '30-35', desc: 'Travail ciblé en séries classiques', intensity: 2 },
  { name: 'Superset', slug: 'superset', duration: '30-35', desc: 'Deux exercices enchaînés sans pause', intensity: 2 },
  { name: 'EMOM', slug: 'emom', duration: '28-32', desc: 'Chaque minute, un effort à compléter', intensity: 2 },
  { name: 'Circuit', slug: 'circuit', duration: '30-38', desc: "Rotation d'ateliers variés en boucle", intensity: 3 },
  { name: 'AMRAP', slug: 'amrap', duration: '28-32', desc: 'Maximum de tours dans le temps imparti', intensity: 3 },
  { name: 'HIIT', slug: 'hiit', duration: '25-30', desc: 'Efforts explosifs, récupération courte', intensity: 4 },
  { name: 'Tabata', slug: 'tabata', duration: '25-28', desc: '20s à fond, 10s de repos, sans répit', intensity: 5 },
];

export function Home() {
  const todayKey = getTodayKey();
  const { session, loading, error } = useSession(todayKey);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();

  useDocumentHead({
    title: 'WAN SHAPE',
    description: 'Chaque jour, une séance de sport guidée sans matériel. 8 formats d\'entraînement, 25-40 min, 100% gratuit.',
  });

  const handleStartSession = () => {
    guardNavigation(`/seance/${todayKey}/play`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {showDisclaimer && (
        <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />
      )}

      {/* Brand header — full width */}
      <BrandHeader />

      {/* Two-column section: Session du jour + Récap */}
      <div className="flex flex-col lg:flex-row lg:items-start px-6 md:px-10 lg:px-14 gap-6 lg:gap-8 pb-8">

        {/* LEFT — Session du jour */}
        <div className="lg:w-1/2 flex flex-col relative rounded-[20px] overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="flex items-center justify-center flex-1 p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">😴</div>
                <p className="text-white/60 text-lg font-medium">Pas de séance prévue aujourd'hui.</p>
                <p className="text-white/30 text-sm mt-2">Profitez-en pour récupérer !</p>
              </div>
            </div>
          )}

          {!loading && session && (
            <SessionPanel
              session={session}
              dateKey={todayKey}
              onStart={handleStartSession}
            />
          )}
        </div>

        {/* RIGHT — Session recap */}
        <div className="lg:w-1/2">
          {loading && (
            <div className="glass-card rounded-[20px] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
              <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="glass-card rounded-[20px] p-6 md:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-5">
                Contenu de la séance
              </h3>
              <p className="text-sm text-white/30">Aucune séance disponible.</p>
            </div>
          )}

          {!loading && session && (
            <SessionRecap session={session} />
          )}
        </div>
      </div>

      {/* Gradient divider */}
      <div className="gradient-divider" />

      {/* Formats section */}
      <section id="formats" className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-7xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Nos formats</h2>
          <p className="text-sm text-white/40">
            8 méthodes d'entraînement, du renforcement doux au cardio maximal.
            {' '}
            <Link to="/formats" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
              En savoir plus
            </Link>
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {FORMATS_COMPACT.map((f) => (
            <Link
              key={f.name}
              to={`/formats/${f.slug}`}
              className="format-card rounded-[14px] p-5 block transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-white/90">{f.name}</h3>
                <span className="text-[11px] font-medium text-white/35">{f.duration} min</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">{f.desc}</p>
              <IntensityDots level={f.intensity} />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <p className="text-white/25 text-xs text-center">
          WAN SHAPE par{' '}
          <a href="https://www.wan-soft.fr" target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white/50 underline transition-colors">
            WAN SOFT
          </a>
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <Link to="/legal/mentions" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Mentions légales
          </Link>
          <Link to="/legal/privacy" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Confidentialité
          </Link>
          <Link to="/legal/cgu" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            CGU
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SessionPanel({ session, dateKey, onStart }: { session: Session; dateKey: string; onStart: () => void }) {
  const image = getSessionImage(session);
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0) || 1;

  return (
    <>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={image} alt="" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/20" />
      </div>

      {/* Content over image */}
      <div className="relative z-10 flex flex-col justify-between flex-1 p-6 md:p-8">
        {/* Top — session info */}
        <div>
          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="session-label px-4 py-1.5 rounded-xl">
              <span className="text-xs font-bold tracking-widest uppercase text-white">SÉANCE DU JOUR</span>
            </div>
          </div>

          {/* Date */}
          <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-3">
            {formatShortDate(dateKey)}
          </p>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight text-white mb-4">
            {session.title.toUpperCase()}
          </h2>

          {/* Focus tags + duration */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {session.focus.map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80">
                {f}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80">
              ~{session.estimatedDuration} min
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed max-w-md">
            {session.description}
          </p>
        </div>

        {/* Bottom — timeline + CTA */}
        <div>
          {/* Timeline */}
          <div className="mb-6">
            <div className="flex gap-1.5 mb-2">
              {timeline.map((t, i) => (
                <div
                  key={i}
                  className="timeline-segment"
                  style={{
                    width: `${(t.duration / totalDuration) * 100}%`,
                    background: t.isAccent
                      ? 'linear-gradient(135deg, #4F46E5, #3B82F6)'
                      : 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              ))}
            </div>
            <div className="flex text-[10px] font-medium tracking-wider uppercase text-white/35">
              {timeline.map((t, i) => {
                const pct = (t.duration / totalDuration) * 100;
                return (
                  <span key={i} className="overflow-hidden whitespace-nowrap" style={{ width: `${pct}%` }}>
                    {pct >= 15 ? t.label : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            className="cta-gradient w-full py-4 rounded-2xl text-base font-bold text-white tracking-wide"
          >
            C'est parti
          </button>
        </div>
      </div>
    </>
  );
}

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`intensity-dot ${i <= level ? 'active' : 'inactive'}`} />
      ))}
    </div>
  );
}
