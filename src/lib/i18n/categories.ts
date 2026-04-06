import type { CategoryPath } from "$lib/api/types";
import type { UiLocaleCode } from "./locale";

export type LocalizedLabelMap = Record<UiLocaleCode, string>;

export interface CategoryDefinition {
  path: CategoryPath;
  labels: LocalizedLabelMap;
}

export const categoryDefinitions: CategoryDefinition[] = [
  {
    path: "items",
    labels: {
      en: "Items",
      fr: "Objets",
      ja: "アイテム",
      de: "Objekte",
      it: "Oggetti",
      es: "Objetos",
      ko: "아이템",
      ru: "Предметы",
    },
  },
  {
    path: "weapons",
    labels: {
      en: "Weapon",
      fr: "Arme",
      ja: "武器",
      de: "Waffe",
      it: "Arma",
      es: "Arma",
      ko: "무기",
      ru: "Оружие",
    },
  },
  {
    path: "armor",
    labels: {
      en: "Armor",
      fr: "Armure",
      ja: "防具",
      de: "Rüstung",
      it: "Armatura",
      es: "Armadura",
      ko: "방어구",
      ru: "Броня",
    },
  },
  {
    path: "skills",
    labels: {
      en: "Skills",
      fr: "Talents",
      ja: "スキル",
      de: "Fähigkeiten",
      it: "Abilità",
      es: "Habilidades",
      ko: "스킬",
      ru: "Навыки",
    },
  },
  {
    path: "decorations",
    labels: {
      en: "Decorations",
      fr: "Joyaux",
      ja: "装飾品",
      de: "Dekorationen",
      it: "Gioielli",
      es: "Adornos",
      ko: "장식품",
      ru: "Украшения",
    },
  },
  {
    path: "charms",
    labels: {
      en: "Charms",
      fr: "Accessoires",
      ja: "チャーム",
      de: "Anhänger",
      it: "Pendenti",
      es: "Colgantes",
      ko: "치장품",
      ru: "Кулоны",
    },
  },
  {
    path: "food-skills",
    labels: {
      en: "Food Skills",
      fr: "Talents du repas",
      ja: "食事スキル",
      de: "Nahrungsfähigkeiten",
      it: "Abilità cibo",
      es: "Habilidades de menú",
      ko: "식사 스킬",
      ru: "Гастронавыки",
    },
  },
  {
    path: "kinsects",
    labels: {
      en: "Kinsect",
      fr: "Kinsecte",
      ja: "猟虫",
      de: "Kinsekt",
      it: "Kinsetto",
      es: "Kinsecto",
      ko: "사냥벌레",
      ru: "Кинсект",
    },
  },
];

export const buildTranslationLabels: LocalizedLabelMap = {
  en: "Build translation",
  fr: "Traduction de build",
  ja: "ビルド翻訳",
  de: "Build-Übersetzung",
  it: "Traduzione build",
  es: "Traducción de build",
  ko: "빌드 번역",
  ru: "Перевод билда",
};

export function getLocalizedLabel(labels: LocalizedLabelMap, locale: UiLocaleCode): string {
  return labels[locale] ?? labels.en;
}
