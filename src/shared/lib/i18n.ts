/* eslint-disable import/no-named-as-default-member */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/shared/locales/de.json';
import en from '@/shared/locales/en.json';

export const SUPPORTED_APP_LANGUAGES = ['de', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_APP_LANGUAGES)[number];

export const resources = {
  de: { translation: de },
  en: { translation: en },
} as const;

function detectLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode ?? 'de';
  return (SUPPORTED_APP_LANGUAGES as readonly string[]).includes(code)
    ? (code as AppLanguage)
    : 'de';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'de',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export function setAppLanguage(lang: AppLanguage) {
  return i18n.changeLanguage(lang);
}

export default i18n;

declare global {
  var __i18n: typeof i18n | undefined;
}
if (__DEV__) globalThis.__i18n = i18n;
