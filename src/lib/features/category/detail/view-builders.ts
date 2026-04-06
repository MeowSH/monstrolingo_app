import type { CategoryDetailData } from "$lib/api/types";
import {
  dedupeStrings,
  formatLabelFromKey,
  getFirstValue,
  isLikelyExternalKey,
  isRecord,
  parseBoolean,
  toDisplay,
  toDisplayString,
  toNumber,
} from "./parsers";
import type {
  ArmorDetailView,
  CharmDetailView,
  DecorationDetailView,
  DetailSkillEntry,
  ElementalDefenseValues,
  KinsectDetailView,
  WeaponDetailView,
} from "./types";

export function dedupeSkillEntries(entries: DetailSkillEntry[]): DetailSkillEntry[] {
  const seen = new Set<string>();
  const deduped: DetailSkillEntry[] = [];
  for (const entry of entries) {
    const key = `${entry.externalKey ?? ""}|${entry.name}|${entry.level ?? ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

export function parseSkillEntry(value: unknown): DetailSkillEntry[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseSkillEntry(entry));
  }
  const primitive = toDisplayString(value);
  if (primitive !== null) {
    return [{ name: primitive, externalKey: null, level: null }];
  }
  if (!isRecord(value)) {
    return [];
  }

  const translation = isRecord(value.translation) ? value.translation : null;
  const name =
    toDisplayString(
      getFirstValue(value, [
        "name",
        "translated_name",
        "skill_name",
        "label",
        "title",
        "original_name",
        "original_text",
      ])
    ) ??
    (translation ? toDisplayString(getFirstValue(translation, ["name"])) : null) ??
    toDisplayString(getFirstValue(value, ["skill_external_key", "external_key", "key", "slug"]));
  const externalKey = toDisplayString(
    getFirstValue(value, ["skill_external_key", "external_key", "key", "slug"])
  );
  const level = toDisplayString(
    getFirstValue(value, ["level", "requested_level", "skill_level", "rank", "max_rank"])
  );

  if (name) {
    return [{ name, externalKey, level }];
  }

  const mappedEntries: DetailSkillEntry[] = [];
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (["translation", "skills", "items", "values", "entries", "list"].includes(entryKey)) {
      continue;
    }

    const parsedNested = parseSkillEntry(entryValue);
    if (parsedNested.length > 0) {
      mappedEntries.push(...parsedNested);
      continue;
    }

    const mappedLevel = toDisplayString(entryValue);
    if (mappedLevel !== null) {
      mappedEntries.push({
        name: formatLabelFromKey(entryKey),
        externalKey: isLikelyExternalKey(entryKey) ? entryKey : null,
        level: mappedLevel,
      });
    }
  }

  return mappedEntries;
}

function splitSkillsBySetFlag(value: unknown): { regular: DetailSkillEntry[]; set: DetailSkillEntry[] } {
  if (!Array.isArray(value)) {
    return { regular: [], set: [] };
  }

  const regular: DetailSkillEntry[] = [];
  const set: DetailSkillEntry[] = [];
  for (const entry of value) {
    const parsedEntry = parseSkillEntry(entry);
    if (parsedEntry.length === 0) {
      continue;
    }

    const setFlag = isRecord(entry)
      ? parseBoolean(
          getFirstValue(entry, [
            "is_set_bonus_skill",
            "isSetBonusSkill",
            "set_bonus_skill",
            "setBonusSkill",
            "is_set_skill",
            "isSetSkill",
          ])
        )
      : null;

    if (setFlag === true) {
      set.push(...parsedEntry);
    } else {
      regular.push(...parsedEntry);
    }
  }

  return {
    regular: dedupeSkillEntries(regular),
    set: dedupeSkillEntries(set),
  };
}

function extractSkillEntries(value: unknown): DetailSkillEntry[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (isRecord(value)) {
    const nested = getFirstValue(value, ["skills", "items", "values", "entries", "list"]);
    const parsedNested = nested !== undefined ? parseSkillEntry(nested) : [];
    const parsedSelf = parseSkillEntry(value);
    return dedupeSkillEntries([...parsedNested, ...parsedSelf]);
  }
  return dedupeSkillEntries(parseSkillEntry(value));
}

function getSkillEntriesByAliases(detail: CategoryDetailData, aliases: string[]): DetailSkillEntry[] {
  const source = detail as Record<string, unknown>;
  const allEntries: DetailSkillEntry[] = [];
  for (const alias of aliases) {
    const value = getFirstValue(source, [alias]);
    if (value !== undefined) {
      allEntries.push(...extractSkillEntries(value));
    }
  }
  return dedupeSkillEntries(allEntries);
}

function extractSlotLevels(value: unknown): number[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractSlotLevels(entry));
  }

  const primitive = toNumber(value);
  if (primitive !== null) {
    return [primitive];
  }
  if (!isRecord(value)) {
    return [];
  }

  const levels: number[] = [];
  for (const key of ["slot_size", "size", "slot_level", "level", "value"]) {
    const maybeLevel = toNumber(value[key]);
    if (maybeLevel !== null) {
      levels.push(maybeLevel);
    }
  }

  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (/slot/i.test(entryKey)) {
      levels.push(...extractSlotLevels(entryValue));
    }
  }

  const nested = getFirstValue(value, [
    "slots",
    "slot_sizes",
    "slotSizes",
    "slot_levels",
    "slotLevels",
    "values",
    "levels",
  ]);
  if (nested !== undefined) {
    levels.push(...extractSlotLevels(nested));
  }

  return levels;
}

function getSlotLevelsByAliases(detail: CategoryDetailData, aliases: string[]): number[] {
  const source = detail as Record<string, unknown>;
  const allSlots: number[] = [];
  for (const alias of aliases) {
    const value = getFirstValue(source, [alias]);
    if (value !== undefined) {
      allSlots.push(...extractSlotLevels(value));
    }
  }

  return allSlots
    .map((slot) => Math.trunc(slot))
    .filter((slot) => Number.isFinite(slot) && slot >= 0);
}

function getOrderedSlotsFromAliases(
  source: Record<string, unknown>,
  slot1Aliases: string[],
  slot2Aliases: string[],
  slot3Aliases: string[]
): number[] | null {
  const slot1 = toNumber(getFirstValue(source, slot1Aliases));
  const slot2 = toNumber(getFirstValue(source, slot2Aliases));
  const slot3 = toNumber(getFirstValue(source, slot3Aliases));

  if (slot1 === null && slot2 === null && slot3 === null) {
    return null;
  }

  return [slot1 ?? 0, slot2 ?? 0, slot3 ?? 0].map((slot) => Math.max(0, Math.trunc(slot)));
}

export function toSlotSymbol(slotLevel: number): string {
  if (slotLevel <= 0) {
    return "ー";
  }
  if (slotLevel === 1) {
    return "①";
  }
  if (slotLevel === 2) {
    return "②";
  }
  if (slotLevel === 3) {
    return "③";
  }
  return String(slotLevel);
}

export function getSlotSymbols(slots: number[]): string[] {
  const normalizedSlots = slots.slice(0, 3);
  while (normalizedSlots.length < 3) {
    normalizedSlots.push(0);
  }
  return normalizedSlots.map((slot) => toSlotSymbol(slot));
}

export function formatSlotsDisplay(slots: number[]): string {
  return getSlotSymbols(slots).join(" ");
}

export function getElementTypeId(value: unknown): number | null {
  const numeric = toNumber(value);
  if (numeric !== null && numeric >= 1 && numeric <= 9) {
    return Math.trunc(numeric);
  }

  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const byName: Record<string, number> = {
    fire: 1,
    water: 2,
    thunder: 3,
    lightning: 3,
    ice: 4,
    dragon: 5,
    poison: 6,
    sleep: 7,
    paralysis: 8,
    paralyze: 8,
    blast: 9,
  };
  return byName[normalized] ?? null;
}

function buildWeaponElementValues(detail: CategoryDetailData): {
  elementTypeLabel: string;
  elementTypeId: number | null;
  elementValue: string;
  elementValueNumber: number | null;
} {
  const source = detail as Record<string, unknown>;
  const elementalContainer = getFirstValue(source, [
    "element",
    "elemental",
    "element_info",
    "elementInfo",
    "element_data",
    "elementData",
    "elemental_attack",
    "element_attack",
  ]);

  let elementTypeRaw = getFirstValue(source, [
    "element_type",
    "elementType",
    "element_name",
    "elementName",
    "element_kind",
    "elementKind",
  ]);
  let elementValueRaw = getFirstValue(source, [
    "element_value",
    "elementValue",
    "element_attack_value",
    "elementAttackValue",
    "element_power",
    "elementPower",
    "element_damage",
    "elementDamage",
    "elemental_attack_value",
    "elementalAttackValue",
    "elemental_damage",
    "elementalDamage",
    "element_attack",
    "elemental_attack",
  ]);

  let elementType = toDisplayString(elementTypeRaw);
  let elementValue = toDisplayString(elementValueRaw);

  if (isRecord(elementalContainer)) {
    if (elementTypeRaw === undefined) {
      elementTypeRaw = getFirstValue(elementalContainer, ["type", "element", "name", "kind"]);
    }
    if (elementValueRaw === undefined) {
      elementValueRaw = getFirstValue(elementalContainer, [
        "value",
        "amount",
        "attack",
        "power",
        "damage",
        "level",
        "elemental_attack",
        "element_attack",
      ]);
    }
    elementType =
      elementType ?? toDisplayString(getFirstValue(elementalContainer, ["type", "element", "name", "kind"]));
    elementValue =
      elementValue ??
      toDisplayString(
        getFirstValue(elementalContainer, [
          "value",
          "amount",
          "attack",
          "power",
          "damage",
          "level",
          "elemental_attack",
          "element_attack",
        ])
      );
  } else if (Array.isArray(elementalContainer)) {
    const firstElement = elementalContainer.find((entry) => entry !== null && entry !== undefined);
    if (firstElement !== undefined) {
      if (isRecord(firstElement)) {
        if (elementTypeRaw === undefined) {
          elementTypeRaw = getFirstValue(firstElement, ["type", "element", "name", "kind"]);
        }
        if (elementValueRaw === undefined) {
          elementValueRaw = getFirstValue(firstElement, [
            "value",
            "amount",
            "attack",
            "power",
            "damage",
            "level",
            "elemental_attack",
            "element_attack",
          ]);
        }
        elementType = elementType ?? toDisplayString(getFirstValue(firstElement, ["type", "element", "name", "kind"]));
        elementValue =
          elementValue ??
          toDisplayString(
            getFirstValue(firstElement, [
              "value",
              "amount",
              "attack",
              "power",
              "damage",
              "level",
              "elemental_attack",
              "element_attack",
            ])
          );
      } else {
        const firstDisplay = toDisplayString(firstElement);
        if (firstDisplay !== null && elementType === null) {
          elementType = firstDisplay;
          elementTypeRaw = firstElement;
        }
      }
    }
  } else if (typeof elementalContainer === "string") {
    if (elementTypeRaw === undefined) {
      elementTypeRaw = elementalContainer;
    }
    elementType = elementType ?? toDisplayString(elementalContainer);
  } else if (typeof elementalContainer === "number") {
    if (elementValueRaw === undefined) {
      elementValueRaw = elementalContainer;
    }
    elementValue = elementValue ?? toDisplayString(elementalContainer);
  }

  return {
    elementTypeLabel: elementType ?? "-",
    elementTypeId: getElementTypeId(elementTypeRaw ?? elementType),
    elementValue: elementValue ?? "-",
    elementValueNumber: toNumber(elementValueRaw ?? elementValue),
  };
}

function buildElementalDefenseValues(detail: CategoryDetailData): ElementalDefenseValues {
  const source = detail as Record<string, unknown>;
  const aliasMap: Record<keyof ElementalDefenseValues, string[]> = {
    fire: ["fire", "fire_res", "fireRes", "fire_resistance", "fireResistance", "fire_defense", "fireDefense"],
    water: ["water", "water_res", "waterRes", "water_resistance", "waterResistance", "water_defense", "waterDefense"],
    thunder: [
      "thunder",
      "thunder_res",
      "thunderRes",
      "thunder_resistance",
      "thunderResistance",
      "lightning_resistance",
      "lightningResistance",
      "electric_resistance",
      "electricResistance",
    ],
    ice: ["ice", "ice_res", "iceRes", "ice_resistance", "iceResistance", "ice_defense", "iceDefense"],
    dragon: ["dragon", "dragon_res", "dragonRes", "dragon_resistance", "dragonResistance", "dragon_defense", "dragonDefense"],
  };
  const result: ElementalDefenseValues = {
    fire: "-",
    water: "-",
    thunder: "-",
    ice: "-",
    dragon: "-",
  };

  const elementalContainer = getFirstValue(source, [
    "elemental_defenses",
    "elemental_defence",
    "elemental_resistances",
    "element_resistances",
    "resistances",
    "elements",
  ]);

  if (isRecord(elementalContainer)) {
    for (const key of Object.keys(result) as (keyof ElementalDefenseValues)[]) {
      const fromContainer = toDisplayString(getFirstValue(elementalContainer, aliasMap[key]));
      if (fromContainer !== null) {
        result[key] = fromContainer;
      }
    }
  }

  if (Array.isArray(elementalContainer)) {
    const elementNameAliases: Record<keyof ElementalDefenseValues, string[]> = {
      fire: ["fire"],
      water: ["water"],
      thunder: ["thunder", "lightning", "electric"],
      ice: ["ice"],
      dragon: ["dragon"],
    };
    for (const entry of elementalContainer) {
      if (!isRecord(entry)) {
        continue;
      }
      const elementName = toDisplayString(getFirstValue(entry, ["element", "type", "name", "key"]));
      if (!elementName) {
        continue;
      }
      const normalized = elementName.toLowerCase();
      const value = toDisplayString(getFirstValue(entry, ["value", "amount", "resistance", "defense", "level"]));
      if (!value) {
        continue;
      }
      for (const key of Object.keys(elementNameAliases) as (keyof ElementalDefenseValues)[]) {
        if (elementNameAliases[key].some((alias) => normalized.includes(alias))) {
          result[key] = value;
        }
      }
    }
  }

  for (const key of Object.keys(result) as (keyof ElementalDefenseValues)[]) {
    if (result[key] !== "-") {
      continue;
    }
    const fromDirect = toDisplayString(getFirstValue(source, aliasMap[key]));
    if (fromDirect !== null) {
      result[key] = fromDirect;
    }
  }

  return result;
}

function extractDisplayList(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return dedupeStrings(value.flatMap((entry) => extractDisplayList(entry)));
  }

  const primitive = toDisplayString(value);
  if (primitive !== null) {
    return [primitive];
  }
  if (!isRecord(value)) {
    return [];
  }

  const direct = toDisplayString(
    getFirstValue(value, ["name", "label", "type", "value", "description", "bonus", "title"])
  );
  if (direct !== null) {
    return [direct];
  }

  const values: string[] = [];
  for (const [entryKey, entryValue] of Object.entries(value)) {
    const entryDisplay = toDisplayString(entryValue);
    if (entryDisplay === null) {
      continue;
    }
    const normalized = entryDisplay.toLowerCase();
    if (normalized === "false") {
      continue;
    }
    if (normalized === "true") {
      values.push(formatLabelFromKey(entryKey));
      continue;
    }
    values.push(`${formatLabelFromKey(entryKey)}: ${entryDisplay}`);
  }
  return dedupeStrings(values);
}

function getDisplayListByAliases(detail: CategoryDetailData, aliases: string[]): string[] {
  const source = detail as Record<string, unknown>;
  const values: string[] = [];
  for (const alias of aliases) {
    const value = getFirstValue(source, [alias]);
    if (value !== undefined) {
      values.push(...extractDisplayList(value));
    }
  }
  return dedupeStrings(values);
}

export function buildWeaponDetailView(detail: CategoryDetailData): WeaponDetailView {
  const source = detail as Record<string, unknown>;
  const weaponElementValues = buildWeaponElementValues(detail);
  const orderedSlots = getOrderedSlotsFromAliases(
    source,
    ["slot1_level", "slot_1_level", "weapon_slot1_level", "weapon_slot_1_level", "slot1", "slot_1"],
    ["slot2_level", "slot_2_level", "weapon_slot2_level", "weapon_slot_2_level", "slot2", "slot_2"],
    ["slot3_level", "slot_3_level", "weapon_slot3_level", "weapon_slot_3_level", "slot3", "slot_3"]
  );
  const fallbackSlots = getSlotLevelsByAliases(detail, [
    "slot1_level",
    "slot2_level",
    "slot3_level",
    "slot_1_level",
    "slot_2_level",
    "slot_3_level",
    "weapon_slot1_level",
    "weapon_slot2_level",
    "weapon_slot3_level",
    "weapon_slot_1_level",
    "weapon_slot_2_level",
    "weapon_slot_3_level",
    "slot1",
    "slot2",
    "slot3",
    "slots",
    "weapon_slots",
    "weaponSlots",
    "slot_sizes",
    "slotSizes",
    "slot_levels",
    "slotLevels",
    "decoration_slots",
  ]);
  return {
    slots: (orderedSlots ?? fallbackSlots).slice(0, 3),
    attack: toDisplay(getFirstValue(source, ["attack", "raw_attack", "attack_power", "base_attack", "atk"])),
    elementTypeLabel: weaponElementValues.elementTypeLabel,
    elementTypeId: weaponElementValues.elementTypeId,
    elementValue: weaponElementValues.elementValue,
    elementValueNumber: weaponElementValues.elementValueNumber,
    associatedSkills: getSkillEntriesByAliases(detail, [
      "associated_skills",
      "weapon_skills",
      "skills",
      "talents",
      "related_skills",
    ]),
  };
}

export function buildArmorDetailView(detail: CategoryDetailData): ArmorDetailView {
  const source = detail as Record<string, unknown>;
  const splitSkills = splitSkillsBySetFlag(
    getFirstValue(source, ["skills", "armor_skills", "armorSkills"])
  );
  const orderedSlots = getOrderedSlotsFromAliases(
    source,
    ["slot1_level", "slot_1_level", "armor_slot1_level", "armor_slot_1_level", "slot1", "slot_1"],
    ["slot2_level", "slot_2_level", "armor_slot2_level", "armor_slot_2_level", "slot2", "slot_2"],
    ["slot3_level", "slot_3_level", "armor_slot3_level", "armor_slot_3_level", "slot3", "slot_3"]
  );
  const fallbackSlots = getSlotLevelsByAliases(detail, [
    "slot1_level",
    "slot2_level",
    "slot3_level",
    "slot_1_level",
    "slot_2_level",
    "slot_3_level",
    "armor_slot1_level",
    "armor_slot2_level",
    "armor_slot3_level",
    "armor_slot_1_level",
    "armor_slot_2_level",
    "armor_slot_3_level",
    "slot1",
    "slot2",
    "slot3",
    "slots",
    "armor_slots",
    "armorSlots",
    "slot_sizes",
    "slotSizes",
    "slot_levels",
    "slotLevels",
    "decoration_slots",
  ]);
  const slots = orderedSlots ?? fallbackSlots;
  return {
    baseDefense: toDisplay(
      getFirstValue(source, ["base_defense", "defense_base", "defense", "baseDefense", "def", "defence"])
    ),
    elementalDefenses: buildElementalDefenseValues(detail),
    slots: slots.slice(0, 3),
    associatedSkills: dedupeSkillEntries([
      ...splitSkills.regular,
      ...getSkillEntriesByAliases(detail, [
        "regular_skills",
        "regularSkills",
        "associated_skills",
        "talents",
      ]),
    ]),
    setSkills: dedupeSkillEntries([
      ...splitSkills.set,
      ...getSkillEntriesByAliases(detail, [
        "set_skills",
        "setSkills",
        "set_bonus_skills",
        "setBonusSkills",
        "set_bonus",
        "set_talents",
      ]),
    ]),
  };
}

export function buildCharmDetailView(detail: CategoryDetailData): CharmDetailView {
  const source = detail as Record<string, unknown>;
  return {
    maxRank: toDisplay(getFirstValue(source, ["max_rank", "rank_max", "max_level", "max_tier", "rank"])),
    associatedSkills: getSkillEntriesByAliases(detail, [
      "associated_skills",
      "charm_skills",
      "skills",
      "talents",
    ]),
  };
}

export function buildDecorationDetailView(detail: CategoryDetailData): DecorationDetailView {
  return {
    associatedSkills: getSkillEntriesByAliases(detail, [
      "associated_skills",
      "decoration_skills",
      "skills",
      "talents",
    ]),
  };
}

export function buildKinsectDetailView(detail: CategoryDetailData): KinsectDetailView {
  const source = detail as Record<string, unknown>;
  return {
    bonuses: getDisplayListByAliases(detail, [
      "bonuses",
      "kinsect_bonuses",
      "bonus_types",
      "bonus",
      "effects",
    ]),
    attackType: toDisplay(
      getFirstValue(source, ["attack_type", "attackType", "kinsect_attack_type", "kinsectAttackType"])
    ),
    powderType: toDisplay(
      getFirstValue(source, ["powder_type", "powderType", "kinsect_powder_type", "kinsectPowderType"])
    ),
  };
}
