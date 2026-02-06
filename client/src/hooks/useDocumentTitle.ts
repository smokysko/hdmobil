import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | HDmobil` : 'HDmobil - Mobilna elektronika';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
