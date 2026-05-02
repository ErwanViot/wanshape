import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useRecipeFavorites } from '../../hooks/useRecipeFavorites.ts';

export interface FavoriteButtonProps {
  recipeKey: string;
  /** Compact icon-only variant for cards; default is icon + label. */
  compact?: boolean;
}

/**
 * Heart toggle backed by `recipe_favorites`. Hidden for visitors — favouriting
 * requires auth so we don't tease a feature we can't deliver. The heart fills
 * when the recipe is favourited; click toggles with optimistic update.
 *
 * Prevents the parent <Link> from navigating: callers wrap recipe cards in a
 * Link, and tapping the heart should not bounce the user to the detail page.
 */
export function FavoriteButton({ recipeKey, compact = false }: FavoriteButtonProps) {
  const { t } = useTranslation('recipes');
  const { user } = useAuth();
  const { favoriteKeys, toggle, pendingKey } = useRecipeFavorites();

  if (!user) return null;

  const isFavorite = favoriteKeys.has(recipeKey);
  const isPending = pendingKey === recipeKey;
  const label = isFavorite ? t('favorites.remove') : t('favorites.add');

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(recipeKey);
      }}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors disabled:opacity-50 ${
        compact
          ? 'p-2 hover:bg-divider'
          : 'px-3 py-1.5 border border-divider hover:border-brand/40 hover:bg-divider text-xs font-medium text-body'
      }`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-brand text-brand' : 'text-muted'}`} aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </button>
  );
}
