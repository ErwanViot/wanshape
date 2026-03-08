/**
 * Page temporaire pour tester l'affichage de toutes les illustrations.
 * À supprimer après validation.
 */
export function ImageTestPage() {
  const heroImages = [
    { name: 'Upper Body', src: '/images/upper.webp' },
    { name: 'Lower Body', src: '/images/lower.webp' },
    { name: 'Core', src: '/images/core.webp' },
    { name: 'Full Body', src: '/images/fullbody.webp' },
    { name: 'Cardio', src: '/images/cardio.webp' },
    { name: 'Stretching', src: '/images/stretching.webp' },
    { name: 'Endurance', src: '/images/endurance.webp' },
    { name: 'Explosive', src: '/images/explosive.webp' },
  ];

  const programImages = [
    { name: 'Débutant 4 semaines', src: '/images/program-debutant.webp' },
    { name: 'Remise en forme', src: '/images/program-remise-en-forme.webp' },
    { name: 'Cardio Express', src: '/images/program-cardio-express.webp' },
  ];

  const illustrations = [
    { name: 'IA Session', src: '/images/illustration-ai-session.webp' },
    { name: 'Programme', src: '/images/illustration-program.webp' },
    { name: 'Empty State', src: '/images/illustration-empty-state.webp' },
    { name: 'Onboarding', src: '/images/illustration-onboarding.webp' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
      <h1 className="text-3xl font-bold text-heading">Test des illustrations</h1>

      {/* ── Session Hero Cards (h-28, comme Formats.tsx) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Session Hero Cards (h-28, object-cover)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heroImages.map((img) => (
            <div key={img.name} className="rounded-2xl overflow-hidden">
              <div className="relative h-28 overflow-hidden">
                <img src={img.src} alt="" className="w-full h-full object-cover object-[50%_30%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-bold text-white text-base drop-shadow-sm">{img.name}</h3>
                  <p className="text-xs text-white/60">25 min · Modéré</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Session Hero large (h-44, comme Home visitor) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Session Preview large (h-44)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heroImages.map((img) => (
            <div key={img.name} className="rounded-2xl overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <img src={img.src} alt="" className="w-full h-full object-cover object-[50%_30%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Aujourd'hui</p>
                  <h3 className="font-display text-lg font-bold text-white uppercase">{img.name}</h3>
                  <p className="text-xs text-white/60 mt-1">~25 min · Core, Cardio</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tomorrow Cards (w-28 thumbnail) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Tomorrow Cards (thumbnail w-28)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heroImages.map((img) => (
            <div key={img.name} className="rounded-2xl overflow-hidden border border-card-border">
              <div className="flex items-stretch min-h-[100px]">
                <div className="relative w-28 shrink-0">
                  <img src={img.src} alt="" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-md">Demain</span>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center bg-surface-card">
                  <p className="text-xs text-muted mb-1">Demain</p>
                  <h3 className="font-display text-base font-bold text-heading truncate">{img.name.toUpperCase()}</h3>
                  <span className="text-xs text-muted mt-1">~25 min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programme Cards (min-h-[220px]) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Programme Cards (min-h-[220px])</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {programImages.map((img) => (
            <div key={img.name} className="group relative rounded-2xl overflow-hidden">
              <div className="relative min-h-[220px] sm:min-h-[260px] flex flex-col">
                <img src={img.src} alt="" className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/70 transition-opacity group-hover:opacity-70" />
                <div className="relative z-10 flex flex-col justify-between flex-1 p-6">
                  <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-1 rounded-full self-start">4 semaines</span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{img.name}</h3>
                    <p className="text-sm text-white/70 mt-1">3x / semaine · ~30 min</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programme Hero (h-36, dashboard) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Programme actif (h-36, dashboard)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programImages.map((img) => (
            <div key={img.name} className="rounded-2xl overflow-hidden">
              <div className="relative h-36">
                <img src={img.src} alt="" className="w-full h-full object-cover object-[50%_30%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-display text-base font-bold text-white uppercase">{img.name}</h3>
                  <p className="text-xs text-white/60 mt-1">8/24 séances · 33%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Illustrations features (banner h-32/h-40) ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">Illustrations features (banner h-32/h-40)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {illustrations.map((img) => (
            <div key={img.name} className="relative rounded-2xl overflow-hidden">
              <img src={img.src} alt="" className="w-full h-32 sm:h-40 object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white drop-shadow-sm">{img.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── OG Image ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-heading">OG Image (1200x630)</h2>
        <div className="rounded-2xl overflow-hidden border border-card-border max-w-xl">
          <img src="/og-image.png" alt="OG Image" className="w-full h-auto" />
        </div>
      </section>
    </div>
  );
}
