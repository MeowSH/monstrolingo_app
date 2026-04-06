import type { UiLocaleCode } from "./locale";

export interface LanguageMeta {
  flag: string;
  nativeName: string;
}

const languageMeta: Record<UiLocaleCode, LanguageMeta> = {
  en: { flag: "🇬🇧", nativeName: "English" },
  fr: { flag: "🇫🇷", nativeName: "Français" },
  ja: { flag: "🇯🇵", nativeName: "日本語" },
  de: { flag: "🇩🇪", nativeName: "Deutsch" },
  it: { flag: "🇮🇹", nativeName: "Italiano" },
  es: { flag: "🇪🇸", nativeName: "Español" },
  ko: { flag: "🇰🇷", nativeName: "한국어" },
  ru: { flag: "🇷🇺", nativeName: "Русский" },
};

function isUiLocaleCode(value: string): value is UiLocaleCode {
  return value in languageMeta;
}

export function getLanguageFlag(code: string): string {
  const normalizedCode = code.toLowerCase();
  if (isUiLocaleCode(normalizedCode)) {
    return languageMeta[normalizedCode].flag;
  }
  return "🌐";
}

export function getLanguageNativeName(code: string, fallback?: string): string {
  const normalizedCode = code.toLowerCase();
  if (isUiLocaleCode(normalizedCode)) {
    return languageMeta[normalizedCode].nativeName;
  }
  return fallback ?? code;
}

export function getLanguageWithFlag(code: string, fallback?: string): string {
  return `${getLanguageFlag(code)} ${getLanguageNativeName(code, fallback)}`;
}
