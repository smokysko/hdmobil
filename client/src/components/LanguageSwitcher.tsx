import React, { useState, useRef, useEffect } from 'react';
import { useI18n, Language } from '../i18n';

// SVG Flag components for cross-browser compatibility (Windows Chrome doesn't show emoji flags)
const SlovakFlag = () => (
  <svg viewBox="0 0 640 480" className="w-5 h-4 rounded-sm shadow-sm flex-shrink-0">
    <path fill="#ee1c25" d="M0 0h640v480H0z"/>
    <path fill="#0b4ea2" d="M0 0h640v320H0z"/>
    <path fill="#fff" d="M0 0h640v160H0z"/>
    <path fill="#fff" d="M233 370.8c-43-20.7-104.6-61.9-104.6-143.2 0-81.4 4-118.4 4-118.4h201.3s4 37 4 118.4c0 81.3-61.6 122.5-104.7 143.2z"/>
    <path fill="#ee1c25" d="M233 360c-39.5-19-96-56.8-96-131.4s3.6-108.6 3.6-108.6h184.8s3.6 34 3.6 108.6S272.5 341 233 360z"/>
    <path fill="#0b4ea2" d="M291.8 177c-19.5-28.3-58.8-28.3-58.8-28.3s-39.3 0-58.8 28.3c0 0 29.3 11.3 58.8 11.3s58.8-11.3 58.8-11.3z"/>
  </svg>
);

const CzechFlag = () => (
  <svg viewBox="0 0 640 480" className="w-5 h-4 rounded-sm shadow-sm flex-shrink-0">
    <path fill="#fff" d="M0 0h640v240H0z"/>
    <path fill="#d7141a" d="M0 240h640v240H0z"/>
    <path fill="#11457e" d="M0 0l320 240L0 480z"/>
  </svg>
);

const flags: Record<Language, React.ReactNode> = {
  sk: <SlovakFlag />,
  cs: <CzechFlag />,
};

const languageNames: Record<Language, string> = {
  sk: 'SK',
  cs: 'CZ',
};

const languageFullNames: Record<Language, string> = {
  sk: 'Slovenčina',
  cs: 'Čeština',
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center h-8" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2 py-1 h-8 rounded hover:bg-gray-100 transition-colors text-xs"
        aria-label="Zmeniť jazyk"
      >
        {flags[language]}
        <span className="font-medium text-gray-700">
          {languageNames[language]}
        </span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]">
          {(['sk', 'cs'] as Language[]).map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLanguageChange(lang);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                language === lang ? 'bg-green-50 text-green-700' : 'text-gray-700'
              }`}
            >
              {flags[lang]}
              <span className="font-medium">{languageFullNames[lang]}</span>
              {language === lang && (
                <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
