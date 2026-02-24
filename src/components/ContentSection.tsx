export function ContentSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}
    >
      <h2 className="text-base font-bold text-heading mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
