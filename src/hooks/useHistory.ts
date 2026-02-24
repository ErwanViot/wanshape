import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { SessionCompletion } from '../types/completion.ts';

export interface HistoryStats {
  completions: SessionCompletion[];
  streak: number;
  totalSessions: number;
  totalDuration: number;
  weekDots: boolean[];
  loading: boolean;
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function computeStreak(completions: SessionCompletion[]): number {
  if (completions.length === 0) return 0;

  const completionDays = new Set(
    completions.map((c) => {
      const d = new Date(c.completed_at);
      return toDateString(d);
    }),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  // Streak must include today or yesterday to be active
  if (!completionDays.has(todayStr) && !completionDays.has(yesterdayStr)) return 0;

  // Start counting from the most recent day that has a completion
  const startDate = completionDays.has(todayStr) ? new Date(today) : new Date(yesterday);
  let streak = 0;
  const cursor = new Date(startDate);

  while (completionDays.has(toDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function computeWeekDots(completions: SessionCompletion[]): boolean[] {
  const completionDays = new Set(
    completions.map((c) => {
      const d = new Date(c.completed_at);
      return toDateString(d);
    }),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun
  // Monday-based: Mon=0 .. Sun=6
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dots: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - mondayOffset + i);
    dots.push(completionDays.has(toDateString(d)));
  }

  return dots;
}

export function useHistory(userId: string | undefined): HistoryStats {
  const [completions, setCompletions] = useState<SessionCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !supabase) {
      setCompletions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from('session_completions')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(200);

        if (cancelled) return;
        setCompletions((data as SessionCompletion[]) ?? []);
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const streak = computeStreak(completions);
  const totalSessions = completions.length;
  const totalDuration = completions.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0);
  const weekDots = computeWeekDots(completions);

  return { completions, streak, totalSessions, totalDuration, weekDots, loading };
}
