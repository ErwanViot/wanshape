import { Facebook, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const INSTAGRAM_URL = 'https://www.instagram.com/wan.2.fit/';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61581314044112';

// Links to the brand's social profiles. Rendered in the public web Footer.
export function SocialLinks() {
  const { t } = useTranslation('marketing');

  return (
    <div className="flex items-center justify-center gap-4">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('social.instagram')}
        className="text-faint hover:text-subtle transition-colors"
      >
        <Instagram className="h-5 w-5" />
      </a>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('social.facebook')}
        className="text-faint hover:text-subtle transition-colors"
      >
        <Facebook className="h-5 w-5" />
      </a>
    </div>
  );
}
