import { useEffect } from 'react';
import { SITE_URL } from '../lib/jsonld.ts';

interface HeadOptions {
  title: string;
  description?: string;
}

const BASE_TITLE = 'Wan2Fit';

export function useDocumentHead({ title, description }: HeadOptions) {
  useEffect(() => {
    document.title = title === BASE_TITLE ? BASE_TITLE : `${title} | ${BASE_TITLE}`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${window.location.pathname}`;

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}
