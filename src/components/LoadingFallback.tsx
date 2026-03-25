export function LoadingFallback() {
  return (
    <div className="px-6 md:px-10 lg:px-14 py-8 max-w-5xl mx-auto space-y-5">
      <div className="skeleton h-8 w-48" />
      <div className="rounded-2xl overflow-hidden border border-card-border p-6 space-y-4">
        <div className="skeleton h-48 w-full rounded-xl" />
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}
