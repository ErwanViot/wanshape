import { Link } from 'react-router';

export interface FeatureHeroCta {
  label: string;
  to: string;
  variant?: 'primary' | 'secondary';
}

interface FeatureHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctas: FeatureHeroCta[];
  visual?: React.ReactNode;
}

export function FeatureHero({ eyebrow, title, subtitle, ctas, visual }: FeatureHeroProps) {
  // When no visual, center the content and cap the width — avoids the "empty-right-half" feel.
  const layoutClass = visual
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center'
    : 'max-w-3xl mx-auto text-center flex flex-col items-center gap-5';

  const ctasWrapperClass = visual ? 'flex flex-wrap gap-3 mt-3' : 'flex flex-wrap justify-center gap-3 mt-3';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand/15 via-surface to-accent/10 px-6 md:px-10 lg:px-14 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className={layoutClass}>
          <div className={visual ? 'flex flex-col gap-5' : 'flex flex-col gap-5 items-center'}>
            {eyebrow ? (
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wide ${visual ? 'self-start' : ''}`}
              >
                {eyebrow}
              </span>
            ) : null}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-heading leading-[1.05]">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-body max-w-xl">{subtitle}</p>
            <div className={ctasWrapperClass}>
              {ctas.map((cta) => (
                <Link
                  key={cta.to}
                  to={cta.to}
                  className={
                    cta.variant === 'secondary'
                      ? 'inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold border border-divider-strong text-heading hover:bg-divider transition-colors'
                      : 'cta-gradient inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-bold text-white shadow-lg hover:shadow-xl transition-shadow'
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
          {visual ? <div className="flex justify-center lg:justify-end">{visual}</div> : null}
        </div>
      </div>
    </section>
  );
}
