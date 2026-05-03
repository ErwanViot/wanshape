export interface FeatureBenefit {
  icon: React.ReactNode;
  title: string;
  body: string;
}

interface FeatureBenefitGridProps {
  sectionLabel: string;
  benefits: FeatureBenefit[];
}

export function FeatureBenefitGrid({ sectionLabel, benefits }: FeatureBenefitGridProps) {
  return (
    <section aria-label={sectionLabel} className="px-6 md:px-10 lg:px-14 py-16 md:py-20 bg-surface-2/50">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-6 ${benefits.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-card-bg border border-card-border p-6 flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-heading">{benefit.title}</h3>
              <p className="text-body text-sm leading-relaxed">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
