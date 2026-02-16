import { getTodayKey, parseDDMMYYYY } from '../utils/date.ts';
import { useSession } from '../hooks/useSession.ts';
import { BLOCK_LABELS } from '../engine/constants.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import type { Session } from '../types/session.ts';

interface Props {
  onStartSession: (dateKey: string) => void;
  onLegal: (tab: 'mentions' | 'privacy' | 'cgu') => void;
  onFormats: () => void;
}

function formatShortDate(dateKey: string): string {
  const d = parseDDMMYYYY(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const FORMATS_COMPACT = [
  { name: 'Pyramide', duration: '30-38', desc: 'Séries croissantes puis décroissantes', intensity: 1 },
  { name: 'Renforcement', duration: '30-35', desc: 'Travail ciblé en séries classiques', intensity: 2 },
  { name: 'Superset', duration: '30-35', desc: 'Deux exercices enchaînés sans pause', intensity: 2 },
  { name: 'EMOM', duration: '28-32', desc: 'Chaque minute, un effort à compléter', intensity: 2 },
  { name: 'Circuit', duration: '30-38', desc: "Rotation d'ateliers variés en boucle", intensity: 3 },
  { name: 'AMRAP', duration: '28-32', desc: 'Maximum de tours dans le temps imparti', intensity: 3 },
  { name: 'HIIT', duration: '25-30', desc: 'Efforts explosifs, récupération courte', intensity: 4 },
  { name: 'Tabata', duration: '25-28', desc: '20s à fond, 10s de repos, sans répit', intensity: 5 },
];

export function Home({ onStartSession, onLegal, onFormats }: Props) {
  const todayKey = getTodayKey();
  const { session, loading, error } = useSession(todayKey);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Two-column section */}
      <div className="flex flex-col lg:flex-row lg:min-h-screen">

        {/* LEFT — Concept glass card */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-14 left-gradient-bg">
          <div className="glass-card rounded-[20px] w-full max-w-lg p-8 md:p-10 lg:p-12">
            {/* Brand */}
            <div className="mb-8 flex items-center gap-3">
              <img
                src="/logo-wansoft.png"
                alt="WanShape"
                className="w-10 h-10"
                style={{ filter: 'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(4438%) hue-rotate(233deg) brightness(91%) contrast(96%)' }}
              />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="gradient-text">Wan Shape</span>
              </h1>
            </div>

            {/* Headline */}
            <h2 className="text-xl md:text-2xl lg:text-[1.7rem] font-bold leading-[1.18] text-white/95 mb-8">
              Chaque jour, une séance guidée sans matériel.
            </h2>

            {/* Value props */}
            <ul className="space-y-4 mb-10">
              <ValueProp
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                title="Prêt à lancer"
                text="Ouvrez, lancez, c'est parti"
              />
              <ValueProp
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                title="Tout est chronométré"
                text="Suivez le rythme, on gère le temps"
              />
              <ValueProp
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                title="Où vous voulez"
                text="Salon, jardin, chambre d'hôtel"
              />
              <ValueProp
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
                title="100% gratuit"
                text="Pas d'abonnement, pas de piège"
              />
            </ul>

            {/* Tags */}
            <div className="flex items-center gap-3 text-xs font-medium text-white/50">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-gray-200">25-40 min</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-gray-200">Sans matériel</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-gray-200">Gratuit</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Session du jour */}
        <div className="lg:w-1/2 flex flex-col relative">
          {loading && (
            <div className="flex items-center justify-center min-h-[85vh] lg:h-full">
              <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && (error || !session) && (
            <div className="flex items-center justify-center min-h-[85vh] lg:h-full p-6">
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
              onStart={() => onStartSession(todayKey)}
            />
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
            <button onClick={onFormats} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
              En savoir plus
            </button>
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {FORMATS_COMPACT.map((f) => (
            <div key={f.name} className="format-card rounded-[14px] p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-white/90">{f.name}</h3>
                <span className="text-[11px] font-medium text-white/35">{f.duration} min</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">{f.desc}</p>
              <IntensityDots level={f.intensity} />
            </div>
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
          <button onClick={() => onLegal('mentions')} className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Mentions légales
          </button>
          <button onClick={() => onLegal('privacy')} className="text-xs text-white/25 hover:text-white/50 transition-colors">
            Confidentialité
          </button>
          <button onClick={() => onLegal('cgu')} className="text-xs text-white/25 hover:text-white/50 transition-colors">
            CGU
          </button>
        </div>
      </footer>
    </div>
  );
}

function SessionPanel({ session, dateKey, onStart }: { session: Session; dateKey: string; onStart: () => void }) {
  const image = getSessionImage(session);

  // Calculate timeline proportions from blocks
  const timeline = session.blocks.map(block => {
    const label = BLOCK_LABELS[block.type];
    const isAccent = block.type !== 'warmup' && block.type !== 'cooldown';
    let duration = 0;

    switch (block.type) {
      case 'warmup':
      case 'cooldown':
        duration = block.exercises.reduce((sum, ex) => sum + (ex.duration * (ex.bilateral ? 2 : 1)), 0);
        break;
      case 'classic':
        duration = block.exercises.reduce((sum, ex) => sum + ex.sets * 30 + (ex.sets - 1) * ex.restBetweenSets, 0);
        break;
      case 'circuit':
        duration = block.rounds * block.exercises.length * 40;
        break;
      case 'hiit':
        duration = block.rounds * (block.work + block.rest);
        break;
      case 'tabata':
        duration = (block.rounds ?? 8) * ((block.work ?? 20) + (block.rest ?? 10)) * (block.sets ?? 1);
        break;
      case 'emom':
        duration = block.minutes * 60;
        break;
      case 'amrap':
        duration = block.duration;
        break;
      case 'superset':
        duration = block.sets * block.pairs.length * 60;
        break;
      case 'pyramid':
        duration = block.pattern.length * block.exercises.length * 30;
        break;
    }

    return { label, isAccent, duration };
  });

  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0) || 1;

  return (
    <>
      {/* Background image */}
      <div className="session-image-wrapper absolute inset-0 z-0">
        <img src={image} alt="" className="w-full h-full object-cover" loading="eager" />
      </div>

      {/* Content over image */}
      <div className="relative z-10 flex flex-col justify-end min-h-[85vh] lg:min-h-screen p-6 md:p-10 lg:p-14">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="session-label px-4 py-1.5 rounded-xl">
            <span className="text-xs font-bold tracking-widest uppercase text-white">SÉANCE DU JOUR</span>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-4">
          {formatShortDate(dateKey)}
        </p>

        {/* Title */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight text-white mb-4">
          {session.title.toUpperCase()}
        </h2>

        {/* Focus tags + duration */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
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
        <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-md mb-8">
          {session.description}
        </p>

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex gap-1.5 mb-2.5">
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
    </>
  );
}

function ValueProp({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="prop-icon" aria-hidden="true">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="text-xs text-white/45">{text}</p>
      </div>
    </li>
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

