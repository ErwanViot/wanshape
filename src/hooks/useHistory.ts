import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { SessionCompletion } from '../types/completion.ts';

export interface CompletionWithTitle extends SessionCompletion {
  session_title: string | null;
  session_description: string | null;
  session_focus: string[];
  block_types: string[];
}

export interface WeeklyData {
  label: string;
  minutes: number;
  sessions: number;
  isCurrent: boolean;
}

export interface HistoryStats {
  completions: CompletionWithTitle[];
  totalSessions: number;
  totalDuration: number;
  avgDuration: number;
  weekDots: boolean[];
  weeklyChart: WeeklyData[];
  thisWeekSessions: number;
  thisWeekDuration: number;
  loading: boolean;
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function computeWeeklyChart(completions: SessionCompletion[]): WeeklyData[] {
  const today = new Date();
  const currentMonday = getMonday(today);

  // Build 8 weeks of buckets (current + 7 previous)
  const weeks: WeeklyData[] = [];
  for (let i = 7; i >= 0; i--) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() - i * 7);
    const weekNum = getISOWeekNumber(monday);
    weeks.push({
      label: `S${weekNum}`,
      minutes: 0,
      sessions: 0,
      isCurrent: i === 0,
    });
  }

  // Fill buckets
  for (const c of completions) {
    const d = new Date(c.completed_at);
    const cMonday = getMonday(d);
    const diffMs = currentMonday.getTime() - cMonday.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (diffWeeks >= 0 && diffWeeks <= 7) {
      const idx = 7 - diffWeeks;
      weeks[idx].minutes += Math.round((c.duration_seconds ?? 0) / 60);
      weeks[idx].sessions += 1;
    }
  }

  return weeks;
}

function computeThisWeekDuration(completions: SessionCompletion[]): number {
  const today = new Date();
  const monday = getMonday(today);
  let total = 0;
  for (const c of completions) {
    const d = new Date(c.completed_at);
    if (d >= monday) {
      total += c.duration_seconds ?? 0;
    }
  }
  return total;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  return Math.round(((d.getTime() - yearStart.getTime()) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7) + 1;
}

interface SessionData {
  title?: string;
  description?: string;
  focus?: string[];
  blocks?: { type: string }[];
}

export function useHistory(userId: string | undefined): HistoryStats {
  const { dataGeneration } = useAuth();
  const [completions, setCompletions] = useState<CompletionWithTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedOnce = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dataGeneration forces re-fetch on auth state change
  useEffect(() => {
    if (!userId || !supabase) {
      setCompletions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    // Only show loading on initial fetch — keep stale data visible during refetch
    if (!hasFetchedOnce.current) {
      setLoading(true);
    }

    (async () => {
      try {
        const { data, sessionExpired } = await supabaseQuery(() =>
          supabase!
            .from('session_completions')
            .select('*, program_sessions(session_data), custom_sessions(session_data)')
            .eq('user_id', userId!)
            .order('completed_at', { ascending: false })
            .limit(200),
        );

        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }

        const rows = (data ?? []) as unknown as (SessionCompletion & {
          program_sessions: { session_data?: SessionData } | null;
          custom_sessions: { session_data?: SessionData } | null;
        })[];

        const enriched: CompletionWithTitle[] = rows.map((row) => {
          const meta = row.metadata as Record<string, unknown>;
          const sd = row.program_sessions?.session_data ?? row.custom_sessions?.session_data;
          return {
            ...row,
            session_title: (meta?.session_title as string | undefined) ?? sd?.title ?? null,
            session_description: (meta?.session_description as string | undefined) ?? sd?.description ?? null,
            session_focus: (meta?.session_focus as string[] | undefined) ?? sd?.focus ?? [],
            block_types: (meta?.block_types as string[] | undefined) ?? [
              ...new Set((sd?.blocks ?? []).map((b) => b.type).filter((t) => t !== 'warmup' && t !== 'cooldown')),
            ],
          };
        });

        setCompletions(enriched);
        hasFetchedOnce.current = true;
        setLoading(false);
      } catch (err) {
        console.error('History fetch error:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, dataGeneration]);

  const derived = useMemo(() => {
    const totalSessions = completions.length;
    const totalDuration = completions.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    const weekDots = computeWeekDots(completions);
    const weeklyChart = computeWeeklyChart(completions);
    const thisWeekSessions = weekDots.filter(Boolean).length;
    const thisWeekDuration = computeThisWeekDuration(completions);
    return {
      totalSessions,
      totalDuration,
      avgDuration,
      weekDots,
      weeklyChart,
      thisWeekSessions,
      thisWeekDuration,
    };
  }, [completions]);

  return { completions, ...derived, loading };
}
