import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/common.json'
import te from '../locales/te/common.json'

const resources = {
  en: {
    translation: en,
  },
  te: {
    translation: te,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n 