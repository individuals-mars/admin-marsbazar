import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome to my app",
          button: "Click me"
        }
      },
      ru: {
        translation: {
          welcome: "Добро пожаловать в мое приложение",
          button: "Нажми меня"
        }
      }
    },
    fallbackLng: 'en', 
    debug: true, 
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
