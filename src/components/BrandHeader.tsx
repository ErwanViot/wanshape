export function BrandHeader() {
  return (
    <header className="px-6 md:px-10 lg:px-14 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Brand + catchphrase */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/logo-wansoft.png"
            alt="WanShape"
            className="w-10 h-10 shrink-0"
            style={{ filter: 'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(4438%) hue-rotate(233deg) brightness(91%) contrast(96%)' }}
          />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Wan Shape</span>
          </h1>
          <span className="text-lg md:text-xl text-white/40 font-medium hidden sm:inline">
            — Chaque jour, une séance guidée sans matériel
          </span>
        </div>

        {/* Value props */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      </div>
    </header>
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
