export const uiLocales = ["en", "fr", "ja", "de", "it", "es", "ko", "ru"] as const;

export type UiLocaleCode = (typeof uiLocales)[number];
