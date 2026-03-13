import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';

interface BackLinkProps {
  to?: string;
  label?: string;
}

export function BackLink({ to = '/', label = 'Retour' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-strong transition-colors mb-8"
    >
      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
