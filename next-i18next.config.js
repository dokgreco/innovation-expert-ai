module.exports = {
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    localeDetection: false, // Forza default locale invece di auto-detect
  },
  react: {
    useSuspense: false, // Evita SSR hydration issues
  },
  returnEmptyString: false, // Mostra chiavi mancanti per debug
  saveMissing: false, // Non salvare chiavi mancanti in prod
  debug: false, // Disabilita debug in production
  interpolation: {
    escapeValue: false, // React già escapa di default
  },
  defaultNS: 'common',
  fallbackNS: 'common',
};