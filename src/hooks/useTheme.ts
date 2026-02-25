import { useCallback, useEffect, useState } from 'react';

type ThemePreference = 'system' | 'dark' | 'light';
type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'wan-shape-theme';
const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#1a1a22',
  light: '#f5f5f7',
};

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') return getSystemTheme();
  return pref;
}

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'system';
}

function applyTheme(resolved: ResolvedTheme) {
  if (resolved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved]);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getStoredPreference);
  const resolved = resolveTheme(preference);

  // Apply theme on preference change
  useEffect(() => {
    applyTheme(resolved);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference, resolved]);

  // Listen to system theme changes when preference is "system"
  useEffect(() => {
    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const cycleTheme = useCallback(() => {
    setPreference((current) => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  }, []);

  return { preference, theme: resolved, cycleTheme } as const;
}
