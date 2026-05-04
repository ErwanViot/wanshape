import { Link } from 'react-router';
import type { FeatureHeroCta } from './FeatureHero.tsx';

interface FeatureCtaProps {
  title: string;
  subtitle?: string;
  ctas: FeatureHeroCta[];
}

export function FeatureCta({ title, subtitle, ctas }: FeatureCtaProps) {
  return (
    <section className="px-6 md:px-10 lg:px-14 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
        <h2 className="font-display text-3xl md:text-4xl font-black text-heading tracking-tight">{title}</h2>
        {subtitle ? <p className="text-lg text-body">{subtitle}</p> : null}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
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
    </section>
  );
}
