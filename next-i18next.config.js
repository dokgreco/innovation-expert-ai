module.exports = {
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    localeDetection: false,
  },
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
  saveMissing: false,
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
  fallbackNS: 'common',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};