import { Facebook, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const INSTAGRAM_URL = 'https://www.instagram.com/wan.2.fit/';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61581314044112';

// Links to the brand's social profiles. Rendered in the public web Footer.
// Circular icon buttons that adopt each network's brand colour on hover.
export function SocialLinks() {
  const { t } = useTranslation('marketing');

  return (
    <div className="flex items-center justify-center gap-3">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('social.instagram')}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-divider text-subtle transition-colors hover:border-transparent hover:bg-gradient-to-tr hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white"
      >
        <Instagram className="h-5 w-5" />
      </a>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('social.facebook')}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-divider text-subtle transition-colors hover:border-transparent hover:bg-[#1877f2] hover:text-white"
      >
        <Facebook className="h-5 w-5" />
      </a>
    </div>
  );
}
