import { useTranslation } from 'react-i18next';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences.ts';

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ id, label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 py-2.5 cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-strong">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded accent-brand cursor-pointer disabled:opacity-50"
      />
    </label>
  );
}

// Notification preferences UI in SettingsPage. The wan2fit philosophy is
// reflected in the categories on offer: info (transactional), progression
// (celebrative), new_content (announcements). No daily reminder, no streak,
// no missed-day prompt — those would push users toward overtraining and
// shame, which the product explicitly refuses.
export function NotificationsSection() {
  const { t } = useTranslation('settings');
  const { preferences, setPreference, isPending } = useNotificationPreferences();

  return (
    <section className="space-y-1">
      <h2 className="text-sm font-bold uppercase tracking-wider text-subtle mb-2">{t('notifications.heading')}</h2>
      <p className="text-xs text-muted mb-2">{t('notifications.description')}</p>
      <div className="rounded-xl border border-divider bg-surface-card divide-y divide-divider/60 px-4">
        <ToggleRow
          id="notif-info"
          label={t('notifications.info_label')}
          description={t('notifications.info_description')}
          checked={preferences.info}
          disabled={isPending}
          onChange={(next) => setPreference('info', next)}
        />
        <ToggleRow
          id="notif-progression"
          label={t('notifications.progression_label')}
          description={t('notifications.progression_description')}
          checked={preferences.progression}
          disabled={isPending}
          onChange={(next) => setPreference('progression', next)}
        />
        <ToggleRow
          id="notif-new-content"
          label={t('notifications.new_content_label')}
          description={t('notifications.new_content_description')}
          checked={preferences.new_content}
          disabled={isPending}
          onChange={(next) => setPreference('new_content', next)}
        />
      </div>
    </section>
  );
}
