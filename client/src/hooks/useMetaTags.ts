import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

function setOrCreateMeta(property: string, content: string, useProperty = false) {
  const attr = useProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useMetaTags({ title, description, image, url }: MetaTagsOptions) {
  useEffect(() => {
    const defaultTitle = 'HDmobil - Mobilna elektronika';
    const defaultDesc = 'Najlepší výber smartfónov, tabletov, príslušenstva a elektroniky za skvelé ceny.';

    const finalTitle = title ? `${title} | HDmobil` : defaultTitle;
    const finalDesc = description || defaultDesc;
    const finalUrl = url || window.location.href;

    document.title = finalTitle;

    setOrCreateMeta('description', finalDesc);

    setOrCreateMeta('og:title', finalTitle, true);
    setOrCreateMeta('og:description', finalDesc, true);
    setOrCreateMeta('og:url', finalUrl, true);
    setOrCreateMeta('og:type', 'product', true);
    if (image) {
      setOrCreateMeta('og:image', image, true);
    }

    setOrCreateMeta('twitter:card', 'summary_large_image');
    setOrCreateMeta('twitter:title', finalTitle);
    setOrCreateMeta('twitter:description', finalDesc);
    if (image) {
      setOrCreateMeta('twitter:image', image);
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [title, description, image, url]);
}
