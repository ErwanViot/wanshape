import type { ReactNode } from 'react';

export function ContentSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}
    >
      <h2 className="text-base font-bold text-heading mb-3 flex items-center gap-2">
        <span className="flex items-center">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
