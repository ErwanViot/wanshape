import { Link } from 'react-router';
import { getTodayKey, getTomorrowKey, parseDDMMYYYY } from '../utils/date.ts';
import { useSession } from '../hooks/useSession.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { computeTimeline } from '../utils/sessionTimeline.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { FORMATS_DATA } from '../data/formats.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { SessionRecap } from './SessionRecap.tsx';
import type { Session } from '../types/session.ts';

function formatShortDate(dateKey: string): string {
  const d = parseDDMMYYYY(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const FORMAT_SHORT_DESCS: Record<string, string> = {
  pyramid: 'Séries croissantes puis décroissantes',
  classic: 'Travail ciblé en séries classiques',
  superset: 'Deux exercices enchaînés sans pause',
  emom: 'Chaque minute, un effort à compléter',
  circuit: "Rotation d'ateliers variés en boucle",
  amrap: 'Maximum de tours dans le temps imparti',
  hiit: 'Efforts explosifs, récupération courte',
  tabata: '20s à fond, 10s de repos, sans répit',
};

export function Home() {
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const { session, loading, error } = useSession(todayKey);
  // error intentionally ignored — if tomorrow's session can't load, we simply hide the panel
  const { session: tomorrowSession, loading: tomorrowLoading } = useSession(tomorrowKey);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();

  useDocumentHead({
    title: 'WAN SHAPE',
    description: 'Chaque jour, une séance de sport guidée sans matériel. 8 formats d\'entraînement, 25-40 min, 100% gratuit.',
  });

  const handleStartSession = () => {
    guardNavigation('/seance/play');
  };

  return (
    <>
      {showDisclaimer && (
        <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />
      )}

      {/* Brand header — full width */}
      <BrandHeader />

      {/* Gradient divider */}
      <div className="gradient-divider mb-8" />

      {/* Two-column grid: today panel + recap side by side, tomorrow panel below left */}
      <div id="main-content" className="grid grid-cols-1 lg:grid-cols-2 px-6 md:px-10 lg:px-14 gap-6 lg:gap-8 pb-8">

        {/* Today panel — col 1, row 1 */}
        <div className="flex flex-col relative rounded-[20px] overflow-hidden lg:row-start-1 lg:col-start-1">
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="flex items-center justify-center flex-1 p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">😴</div>
                <p className="text-body text-lg font-medium">Pas de séance prévue aujourd'hui.</p>
                <p className="text-faint text-sm mt-2">Profitez-en pour récupérer !</p>
              </div>
            </div>
          )}

          {!loading && session && (
            <SessionPanel
              session={session}
              dateKey={todayKey}
              onStart={handleStartSession}
              badge="SÉANCE DU JOUR"
              showCta
            />
          )}
        </div>

        {/* Session recap — col 2, row 1+2 on desktop / order 2 on mobile */}
        <div className="lg:row-start-1 lg:row-span-2 lg:col-start-2">
          {loading && (
            <div className="glass-card rounded-[20px] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
              <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="glass-card rounded-[20px] p-6 md:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtle mb-5">
                Contenu de la séance
              </h3>
              <p className="text-sm text-faint">Aucune séance disponible.</p>
            </div>
          )}

          {!loading && session && (
            <SessionRecap session={session} />
          )}
        </div>

        {/* Tomorrow panel — col 1, row 2 on desktop / last on mobile */}
        {!tomorrowLoading && tomorrowSession && (
          <section
            aria-label="Aperçu de la séance de demain"
            className="flex flex-col relative rounded-[20px] overflow-hidden lg:row-start-2 lg:col-start-1"
          >
            <SessionPanel
              session={tomorrowSession}
              dateKey={tomorrowKey}
              badge="SÉANCE DE DEMAIN"
              variant="tomorrow"
              showCta={false}
            />
          </section>
        )}
      </div>

      {/* Gradient divider */}
      <div className="gradient-divider" />

      {/* Formats section */}
      <section id="formats" className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-7xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-heading mb-2">Nos formats</h2>
          <p className="text-sm text-muted">
            8 méthodes d'entraînement, du renforcement doux au cardio maximal.
            {' '}
            <Link to="/formats" className="text-link hover:text-link-hover underline underline-offset-2 transition-colors">
              En savoir plus
            </Link>
            {' · '}
            <Link to="/exercices" className="text-link hover:text-link-hover underline underline-offset-2 transition-colors">
              Nos exercices
            </Link>
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {FORMATS_DATA.map((f) => (
            <Link
              key={f.type}
              to={`/formats/${f.slug}`}
              className="format-card rounded-[14px] p-5 block transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-strong">{f.name}</h3>
                <span className="text-[11px] font-medium text-faint">{f.duration} min</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">{FORMAT_SHORT_DESCS[f.type] ?? f.shortDescription}</p>
              <IntensityDots level={f.intensity} />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

/* SessionPanel stays fully white — it's over an image */
function SessionPanel({ session, dateKey, onStart, badge = 'SÉANCE DU JOUR', variant = 'today', showCta = true }: {
  session: Session;
  dateKey: string;
  onStart?: () => void;
  badge?: string;
  variant?: 'today' | 'tomorrow';
  showCta?: boolean;
}) {
  const image = getSessionImage(session);
  const difficulty = computeDifficulty(session);
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0) || 1;
  const isTomorrow = variant === 'tomorrow';

  return (
    <>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={image} alt="" className="w-full h-full object-cover" loading={isTomorrow ? 'lazy' : 'eager'} />
        <div className={`absolute inset-0 bg-gradient-to-b ${isTomorrow ? 'from-black/95 via-black/60 to-black/40' : 'from-black/90 via-black/40 to-black/20'}`} />
      </div>

      {/* Content over image */}
      <div className="relative z-10 flex flex-col justify-between flex-1 p-6 md:p-8">
        {/* Top — session info */}
        <div>
          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`${isTomorrow ? 'session-label-tomorrow' : 'session-label'} px-4 py-1.5 rounded-xl`}>
              <span className="text-xs font-bold tracking-widest uppercase text-white">{badge}</span>
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              difficulty.level === 'accessible'
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : difficulty.level === 'modere'
                  ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  : 'bg-red-500/20 border-red-400/30 text-red-300'
            }`}>
              {difficulty.label}
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
                      ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-secondary))'
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
          {showCta && onStart && (
            <button
              onClick={onStart}
              className="cta-gradient w-full py-4 rounded-2xl text-base font-bold text-white tracking-wide cursor-pointer"
            >
              C'est parti
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Intensité ${level} sur 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`intensity-dot ${i <= level ? 'active' : 'inactive'}`} />
      ))}
    </div>
  );
}
