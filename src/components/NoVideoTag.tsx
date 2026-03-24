export function NoVideoTag({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-amber-500/10 text-white/50 ${className ?? ''}`}>
      <span aria-hidden="true">🚧</span>
      Pas encore de vidéo pour cet exercice
    </span>
  );
}
