export type BackendErrorCode = "invalid_argument" | "not_found" | "internal" | string;

export interface BackendErrorPayload {
  code: BackendErrorCode;
  message: string;
  details: unknown;
}

export interface HealthResponse {
  status: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export interface LanguagesResponse {
  languages: LanguageOption[];
}

export interface GameVersionResponse {
  game_version: string;
}

export type CategoryPath =
  | "items"
  | "weapons"
  | "armor"
  | "skills"
  | "decorations"
  | "charms"
  | "food-skills"
  | "kinsects";

export interface CategoryTableCell {
  language: string;
  name: string;
  description?: string | null;
}

export interface CategoryTableItem {
  external_key: string;
  source: CategoryTableCell;
  target: CategoryTableCell;
}

export interface TablePagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
}

export interface CategoryTableResponse {
  items: CategoryTableItem[];
  pagination: TablePagination;
}

export interface CategoryDetailTranslation {
  language_code: string;
  name: string;
  description?: string | null;
  slug?: string;
}

export interface CategoryDetailData {
  external_key: string;
  translation?: CategoryDetailTranslation;
  [key: string]: unknown;
}

export interface CategoryDetailResponse {
  data: CategoryDetailData;
}

export interface LinkBuildTranslateRequest {
  url: string;
  target_lang: string;
}

export interface LinkBuildSkillOriginal {
  text: string;
  name: string;
  requested_level: number | null;
}

export interface LinkBuildAssociatedJewel {
  decoration_external_key: string;
  name: string;
  slot_size: number;
  rarity: number;
  skill_level: number | null;
}

export interface LinkBuildSkillTranslated {
  original_text: string;
  original_name: string;
  requested_level: number | null;
  name: string;
  translated: boolean;
  skill_external_key?: string;
  associated_jewels?: LinkBuildAssociatedJewel[];
}

export interface LinkBuildUnmatchedElement {
  kind: string;
  value: string;
  reason: string;
}

export interface LinkBuildTranslateResponse {
  source_lang_detected: string;
  target_lang: string;
  translation_mode: "full" | "partial" | string;
  skills_original: LinkBuildSkillOriginal[];
  // Legacy field kept for backward compatibility.
  skills_translated?: LinkBuildSkillTranslated[];
  set_skills_translated?: LinkBuildSkillTranslated[];
  armor_jewel_skills_translated?: LinkBuildSkillTranslated[];
  unmatched_elements: LinkBuildUnmatchedElement[];
}

export interface CategoryTableQuery {
  source_lang: string;
  target_lang: string;
  page?: number;
  limit?: number;
}
