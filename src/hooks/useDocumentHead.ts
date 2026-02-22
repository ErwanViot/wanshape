import { useEffect } from 'react';

interface HeadOptions {
  title: string;
  description?: string;
}

const BASE_TITLE = 'WAN SHAPE';

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

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}
