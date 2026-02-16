import { useState, useEffect } from 'react';
import { useSession } from './hooks/useSession.ts';
import { Home } from './components/Home.tsx';
import { SessionOverview } from './components/SessionOverview.tsx';
import { Player } from './components/Player.tsx';
import { Legal } from './components/Legal.tsx';
import { Formats } from './components/Formats.tsx';
import { HealthDisclaimer, useHealthDisclaimer } from './components/HealthDisclaimer.tsx';

type LegalTab = 'mentions' | 'privacy' | 'cgu';

type View =
  | { type: 'home' }
  | { type: 'overview'; dateKey: string }
  | { type: 'player'; dateKey: string }
  | { type: 'legal'; tab: LegalTab }
  | { type: 'formats' };

export default function App() {
  const [view, setView] = useState<View>({ type: 'home' });
  const [pendingDateKey, setPendingDateKey] = useState<string | null>(null);
  const health = useHealthDisclaimer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const dateKey = (view.type === 'overview' || view.type === 'player') ? view.dateKey : null;
  const { session } = useSession(dateKey);

  // Health disclaimer shown before first session access
  if (pendingDateKey && !health.accepted) {
    return (
      <HealthDisclaimer
        onAccept={() => {
          health.accept();
          setView({ type: 'overview', dateKey: pendingDateKey });
          setPendingDateKey(null);
        }}
      />
    );
  }

  if (view.type === 'player' && session) {
    return (
      <Player
        session={session}
        onBack={() => setView({ type: 'home' })}
      />
    );
  }

  if (view.type === 'overview' && session) {
    return (
      <SessionOverview
        session={session}
        onStart={() => setView({ type: 'player', dateKey: view.dateKey })}
        onBack={() => setView({ type: 'home' })}
      />
    );
  }

  if (view.type === 'formats') {
    return (
      <Formats
        onBack={() => setView({ type: 'home' })}
      />
    );
  }

  if (view.type === 'legal') {
    return (
      <Legal
        initialTab={view.tab}
        onBack={() => setView({ type: 'home' })}
      />
    );
  }

  return (
    <Home
      onStartSession={(key) => {
        if (!health.accepted) {
          setPendingDateKey(key);
        } else {
          setView({ type: 'overview', dateKey: key });
        }
      }}
      onLegal={(tab) => setView({ type: 'legal', tab })}
      onFormats={() => setView({ type: 'formats' })}
    />
  );
}
