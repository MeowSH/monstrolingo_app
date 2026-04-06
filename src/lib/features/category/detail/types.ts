export type DetailSkillEntry = {
  name: string;
  externalKey: string | null;
  level: string | null;
};

export type ElementalDefenseValues = {
  fire: string;
  water: string;
  thunder: string;
  ice: string;
  dragon: string;
};

export type WeaponDetailView = {
  slots: number[];
  attack: string;
  elementTypeLabel: string;
  elementTypeId: number | null;
  elementValue: string;
  elementValueNumber: number | null;
  associatedSkills: DetailSkillEntry[];
};

export type ArmorDetailView = {
  baseDefense: string;
  elementalDefenses: ElementalDefenseValues;
  slots: number[];
  associatedSkills: DetailSkillEntry[];
  setSkills: DetailSkillEntry[];
};

export type CharmDetailView = {
  maxRank: string;
  associatedSkills: DetailSkillEntry[];
};

export type DecorationDetailView = {
  associatedSkills: DetailSkillEntry[];
};

export type KinsectDetailView = {
  bonuses: string[];
  attackType: string;
  powderType: string;
};
