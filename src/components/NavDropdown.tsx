import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

type NavSubItem = {
  to: string;
  labelKey: string;
  match: (pathname: string) => boolean;
};

type NavDropdownProps = {
  triggerLabelKey: string;
  items: ReadonlyArray<NavSubItem>;
};

export function NavDropdown({ triggerLabelKey, items }: NavDropdownProps) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const anyChildActive = items.some((item) => item.match(pathname));

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger — we want to close the menu when navigation occurs
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          anyChildActive ? 'text-brand bg-brand/10' : 'text-muted hover:text-heading hover:bg-divider'
        }`}
      >
        {t(triggerLabelKey)}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[180px] py-1 bg-card-bg border border-divider rounded-lg shadow-lg z-50">
          {items.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-brand bg-brand/10' : 'text-body hover:bg-divider'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
