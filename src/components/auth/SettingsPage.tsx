import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Moon, Sun, Monitor, Crown, Sparkles, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useSubscription } from '../../hooks/useSubscription.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { getInitials } from '../../utils/getInitials.ts';
import { formatDate } from '../../utils/date.ts';
import { supabase } from '../../lib/supabase.ts';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Clair', Icon: Sun },
  { value: 'dark' as const, label: 'Sombre', Icon: Moon },
  { value: 'system' as const, label: 'Système', Icon: Monitor },
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 Mo
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { preference, setTheme } = useTheme();
  const { isPremium, subscription, manageSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);

  useDocumentHead({
    title: 'Paramètres',
    description: 'Gère ton compte Wan2Fit.',
  });

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name;
  const initials = getInitials(displayName, user?.email);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !supabase) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError('Format accepté : JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('L\u2019image ne doit pas dépasser 2 Mo.');
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Append timestamp to bust cache
      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
      if (updateError) throw updateError;

      await refreshProfile();
    } catch {
      setAvatarError('Erreur lors de l\u2019envoi. Réessaie.');
    } finally {
      setAvatarUploading(false);
      // Reset input so re-selecting same file triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-6 py-8 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="relative w-14 h-14 rounded-full shrink-0 group cursor-pointer"
            aria-label="Changer la photo de profil"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg bg-brand">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" aria-hidden="true" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
          </button>
          <div className="min-w-0 flex-1">
            {displayName && <h1 className="text-xl font-bold text-heading truncate">{displayName}</h1>}
            <p className="text-sm text-muted truncate">{user?.email}</p>
            <p className="text-xs text-faint mt-0.5">
              Membre depuis {user?.created_at ? formatDate(user.created_at) : '—'}
            </p>
          </div>
        </div>

        {avatarError && (
          <p className="text-xs text-red-400 text-center -mt-4">{avatarError}</p>
        )}

        {/* Theme */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Apparence</h2>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={preference === value}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors cursor-pointer ${
                  preference === value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-divider text-muted hover:border-divider-strong'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Checkout success */}
        {checkoutSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
            Bienvenue dans Premium ! Ton abonnement est actif.
          </div>
        )}

        {/* Subscription */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Abonnement</h2>
          {isPremium ? (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" aria-hidden="true" />
                <span className="text-sm font-bold text-heading">Premium</span>
              </div>
              {subscription?.cancel_at_period_end && subscription.current_period_end && (
                <p className="text-xs text-muted">
                  Se termine le{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              {!subscription?.cancel_at_period_end && subscription?.current_period_end && (
                <p className="text-xs text-muted">
                  Prochain renouvellement le{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              <button
                type="button"
                onClick={async () => { setPortalError(null); const err = await manageSubscription(); if (err) setPortalError(err); }}
                className="w-full py-2.5 rounded-xl border border-accent/30 text-sm font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer"
              >
                Gérer mon abonnement
              </button>
              {portalError && (
                <p className="text-xs text-red-400 mt-2">{portalError}</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-divider bg-surface-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted">Plan Gratuit</span>
              </div>
              <p className="text-xs text-muted">
                Passe à Premium pour accéder aux séances et programmes IA personnalisés.
              </p>
              <Link
                to="/tarifs"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Passer Premium
              </Link>
            </div>
          )}
        </section>

        {/* Legal */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Informations</h2>
          <div className="space-y-1">
            <Link to="/legal/cgu" className="block py-2.5 text-sm text-body hover:text-heading transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="/legal/privacy" className="block py-2.5 text-sm text-body hover:text-heading transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/legal/cgv" className="block py-2.5 text-sm text-body hover:text-heading transition-colors">
              Conditions Générales de Vente
            </Link>
          </div>
        </section>

        {/* Sign out */}
        <button
          type="button"
          onClick={signOut}
          className="w-full py-3 rounded-xl text-red-400 font-semibold border border-red-400/30 hover:bg-red-400/10 transition-colors cursor-pointer"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
