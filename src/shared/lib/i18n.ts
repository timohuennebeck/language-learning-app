/* eslint-disable import/no-named-as-default-member */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/shared/locales/de.json';
import en from '@/shared/locales/en.json';

/** Interface languages users can pick. `en.json` exists but stays hidden until the app is final. */
export const SUPPORTED_APP_LANGUAGES = ['de'] as const;
export type AppLanguage = (typeof SUPPORTED_APP_LANGUAGES)[number];

const resources = {
  de: { translation: de },
  en: { translation: en },
} as const;

/** Strings keyed by app locale (`de`, `en`, …), as stored in the database's jsonb columns. */
export type Localized = Record<string, string>;

/** Picks the app-language string, falling back to English, then to whatever exists. */
export function localized(map: Localized, locale: string): string {
  return map[locale] ?? map.en ?? Object.values(map)[0] ?? '';
}

export function isAppLanguage(code: string | null | undefined): code is AppLanguage {
  return (SUPPORTED_APP_LANGUAGES as readonly string[]).includes(code ?? '');
}

/** Device locale when supported, otherwise German (the product's default). */
export function detectLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return isAppLanguage(code) ? code : 'de';
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

/** Switches the UI language; a no-op when it is already active (changeLanguage would re-render every consumer). */
export function setAppLanguage(lang: AppLanguage) {
  return i18n.language === lang
    ? Promise.resolve()
    : i18n.changeLanguage(lang).then(() => undefined);
}

export default i18n;
