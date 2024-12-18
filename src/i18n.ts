import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { registerLocale } from 'react-datepicker';
import {
  enUS, ja,
} from 'date-fns/locale';

// Locales
import * as locales from './locales';

registerLocale('enUS', enUS);
registerLocale('ja', ja);

// Translations
i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: locales,
    ns: 'main',
    missingKeyHandler: false,

    supportedLngs: ['enUS', 'ja', 'ar'],
    fallbackLng: 'enUS',
    fallbackNS: 'main',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
