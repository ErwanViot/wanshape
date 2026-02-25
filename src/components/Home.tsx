import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { usePrograms } from '../hooks/useProgram.ts';
import { useSession } from '../hooks/useSession.ts';
import { supabase } from '../lib/supabase.ts';
import type { Session } from '../types/session.ts';
import { getTodayKey, getTomorrowKey, parseDDMMYYYY } from '../utils/date.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { computeTimeline } from '../utils/sessionTimeline.ts';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { ProgramCard } from './ProgramCard.tsx';
import { SessionRecap } from './SessionRecap.tsx';
import { StreakWidget } from './StreakWidget.tsx';

function formatShortDate(dateKey: string): string {
  const d = parseDDMMYYYY(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function Home() {
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const { session, loading, error } = useSession(todayKey);
  const { session: tomorrowSession, loading: tomorrowLoading } = useSession(tomorrowKey);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();
  const { user } = useAuth();

  useDocumentHead({
    title: 'WAN SHAPE',
    description:
      "Chaque jour, une séance de sport guidée sans matériel. 8 formats d'entraînement, 25-40 min, 100% gratuit.",
  });

  const handleStartSession = () => {
    guardNavigation('/seance/play');
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}

      {/* Brand header — full width */}
      <BrandHeader />

      {/* Logged-in: streak widget */}
      {user && (
        <>
          <StreakWidget />
          <div className="gradient-divider" />
        </>
      )}

      {/* Visitor: signup banner */}
      {!user && supabase && <SignupBanner />}

      {/* Session du jour — CTA visible above fold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 px-6 md:px-10 lg:px-14 gap-6 lg:gap-8 py-8">
        {/* Today panel */}
        <div className="flex flex-col relative rounded-[20px] overflow-hidden lg:row-start-1 lg:col-start-1">
          {loading && (
            <div className="flex items-center justify-center flex-1 min-h-[300px]">
              <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="flex items-center justify-center flex-1 p-6 min-h-[200px]">
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

        {/* Session recap — below on mobile, alongside on desktop */}
        <div className="lg:row-start-1 lg:row-span-2 lg:col-start-2">
          {loading && (
            <div className="glass-card rounded-[20px] p-6 md:p-8 flex items-center justify-center min-h-[200px]">
              <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="glass-card rounded-[20px] p-6 md:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-subtle mb-5">Contenu de la séance</h3>
              <p className="text-sm text-faint">Aucune séance disponible.</p>
            </div>
          )}

          {!loading && session && <SessionRecap session={session} />}
        </div>

        {/* Tomorrow panel — col 1, row 2 on desktop / below on mobile */}
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

      {/* Programs section */}
      <div className="gradient-divider" />
      <ProgramsTeaser />

      <Footer />
    </>
  );
}

function SignupBanner() {
  return (
    <div className="px-6 md:px-10 lg:px-14 py-6">
      <div className="glass-card rounded-[20px] p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-heading mb-1">Gardez une trace de vos efforts</h2>
          <p className="text-sm text-muted leading-relaxed">
            Créez un compte gratuit pour sauvegarder vos séances, construire votre streak et suivre vos programmes.
          </p>
        </div>
        <Link
          to="/signup"
          className="cta-gradient px-6 py-3 rounded-xl text-sm font-bold text-white whitespace-nowrap shrink-0"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
}

function ProgramsTeaser() {
  const { programs, loading } = usePrograms();

  if (loading || programs.length === 0) return null;

  return (
    <section className="px-6 md:px-10 lg:px-14 py-10 md:py-14">
      <div className="max-w-7xl mx-auto mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-heading mb-2">Programmes</h2>
        <p className="text-sm text-muted">
          Obtenez des résultats visibles avec des programmes guidés sur plusieurs semaines.{' '}
          <Link
            to="/programmes"
            className="text-link hover:text-link-hover underline underline-offset-2 transition-colors"
          >
            Voir tous les programmes
          </Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.slice(0, 3).map((p) => (
          <ProgramCard key={p.id} program={p} compact />
        ))}
      </div>
    </section>
  );
}

/* SessionPanel stays fully white — it's over an image */
function SessionPanel({
  session,
  dateKey,
  onStart,
  badge = 'SÉANCE DU JOUR',
  variant = 'today',
  showCta = true,
}: {
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
        <div
          className={`absolute inset-0 bg-gradient-to-b ${isTomorrow ? 'from-black/95 via-black/60 to-black/40' : 'from-black/90 via-black/40 to-black/20'}`}
        />
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
          <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-3">{formatShortDate(dateKey)}</p>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight text-white mb-4">
            {session.title.toUpperCase()}
          </h2>

          {/* Focus tags + duration */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {session.focus.map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80"
              >
                {f}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80">
              ~{session.estimatedDuration} min
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                difficulty.level === 'accessible'
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : difficulty.level === 'modere'
                    ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                    : 'bg-red-500/20 border-red-400/30 text-red-300'
              }`}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed max-w-md">{session.description}</p>
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
              type="button"
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
