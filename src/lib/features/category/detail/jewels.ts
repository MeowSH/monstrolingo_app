import type { CategoryDetailData } from "$lib/api/types";
import { dedupeStrings, getFirstValue, isRecord, toDisplayString } from "./parsers";

function extractJewelNames(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return dedupeStrings(value.flatMap((entry) => extractJewelNames(entry)));
  }

  const primitive = toDisplayString(value);
  if (primitive !== null) {
    return [primitive];
  }
  if (!isRecord(value)) {
    return [];
  }

  const translation = isRecord(value.translation) ? value.translation : null;
  const jewelName =
    toDisplayString(
      getFirstValue(value, [
        "name",
        "jewel_name",
        "jewelName",
        "decoration_name",
        "decorationName",
        "translated_name",
        "label",
        "title",
        "source_name",
        "sourceName",
      ])
    ) ??
    (translation ? toDisplayString(getFirstValue(translation, ["name"])) : null) ??
    toDisplayString(
      getFirstValue(value, [
        "external_key",
        "decoration_external_key",
        "decorationExternalKey",
        "jewel_external_key",
        "jewelExternalKey",
      ])
    );

  const names: string[] = [];
  if (jewelName) {
    names.push(jewelName);
  }

  const nested = getFirstValue(value, [
    "associated_jewels",
    "associatedJewels",
    "associated_decorations",
    "associatedDecorations",
    "decorations",
    "jewels",
    "items",
    "list",
    "entries",
    "values",
  ]);
  if (nested !== undefined) {
    names.push(...extractJewelNames(nested));
  }

  const sourceType = toDisplayString(
    getFirstValue(value, ["source_type", "sourceType", "type", "kind", "origin_type", "originType"])
  )?.toLowerCase();
  if ((sourceType?.includes("decor") || sourceType?.includes("jewel")) && jewelName === null) {
    const fromTypeEntry = toDisplayString(
      getFirstValue(value, ["source_name", "sourceName", "name", "label", "title"])
    );
    if (fromTypeEntry !== null) {
      names.push(fromTypeEntry);
    }
  }

  return dedupeStrings(names);
}

export function getAssociatedJewelNames(detail: CategoryDetailData): string[] {
  const source = detail as Record<string, unknown>;
  const values: string[] = [];

  const directAliases = [
    "associated_jewels",
    "associatedJewels",
    "associated_decorations",
    "associatedDecorations",
    "decorations",
    "jewels",
    "jewel_list",
    "jewelList",
    "decoration_list",
    "decorationList",
    "related_decorations",
    "relatedDecorations",
    "available_decorations",
    "availableDecorations",
    "craftable_decorations",
    "craftableDecorations",
    "decoration_sources",
    "decorationSources",
    "jewel_sources",
    "jewelSources",
  ];

  for (const alias of directAliases) {
    const value = getFirstValue(source, [alias]);
    if (value !== undefined) {
      values.push(...extractJewelNames(value));
    }
  }

  const sourceEntries = getFirstValue(source, ["sources", "origins", "where_to_get", "whereToGet"]);
  if (Array.isArray(sourceEntries)) {
    for (const entry of sourceEntries) {
      if (!isRecord(entry)) {
        continue;
      }
      const sourceType = toDisplayString(
        getFirstValue(entry, ["source_type", "sourceType", "type", "kind", "origin_type", "originType"])
      )?.toLowerCase();
      if (sourceType?.includes("decor") || sourceType?.includes("jewel")) {
        values.push(...extractJewelNames(entry));
      }
    }
  }

  return dedupeStrings(values);
}
