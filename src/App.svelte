<script lang="ts">
  import { onMount } from "svelte";
  import logo from "../assets/img/logo/montrolingo.png";
  import elementType1Icon from "../assets/img/elementTypesIcons/ElementType1.png";
  import elementType2Icon from "../assets/img/elementTypesIcons/ElementType2.png";
  import elementType3Icon from "../assets/img/elementTypesIcons/ElementType3.png";
  import elementType4Icon from "../assets/img/elementTypesIcons/ElementType4.png";
  import elementType5Icon from "../assets/img/elementTypesIcons/ElementType5.png";
  import elementType6Icon from "../assets/img/elementTypesIcons/ElementType6.png";
  import elementType7Icon from "../assets/img/elementTypesIcons/ElementType7.png";
  import elementType8Icon from "../assets/img/elementTypesIcons/ElementType8.png";
  import elementType9Icon from "../assets/img/elementTypesIcons/ElementType9.png";
  import { apiClient, BackendApiError } from "$lib/api/client";
  import type {
    CategoryDetailData,
    CategoryPath,
    CategoryTableItem,
    LanguageOption,
    LinkBuildAssociatedJewel,
    LinkBuildSkillTranslated,
    LinkBuildTranslateResponse,
    TablePagination,
  } from "$lib/api/types";
  import { categoryDefinitions, buildTranslationLabels, getLocalizedLabel } from "$lib/i18n/categories";
  import { getDictionary } from "$lib/i18n/dictionary";
  import { getLanguageFlag } from "$lib/i18n/flags";
  import { uiLocales, type UiLocaleCode } from "$lib/i18n/locale";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import AppSidebar from "$lib/features/layout/AppSidebar.svelte";
  import AppToolbarCard from "$lib/features/layout/AppToolbarCard.svelte";
  import CategoryTablePanel from "$lib/features/category/CategoryTablePanel.svelte";
  import CategoryDetailPanel from "$lib/features/category/CategoryDetailPanel.svelte";
  import BuildTranslationPanel from "$lib/features/build/BuildTranslationPanel.svelte";
  import {
    buildArmorDetailView,
    buildCharmDetailView,
    buildDecorationDetailView,
    buildKinsectDetailView,
    buildWeaponDetailView,
    formatSlotsDisplay,
  } from "$lib/features/category/detail/view-builders";
  import type { DetailSkillEntry } from "$lib/features/category/detail/types";
  import { getAssociatedJewelNames } from "$lib/features/category/detail/jewels";
  import { matchesTableSearch } from "$lib/features/category/table/search";
  import { formatDescription, formatError as formatErrorMessage, interpolate } from "$lib/features/shared/format";
  import { applyTheme, initializeTheme, type ThemeMode } from "$lib/features/shared/theme";

  type AppView = "category" | "build";
  type BuildDecorationDetailView = {
    skillName: string;
    originalText: string;
    associatedJewels: LinkBuildAssociatedJewel[];
  };

  const emptyPagination: TablePagination = {
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 0,
    has_next: false,
  };

  const pageLimit = 25;
  const uiLocaleOptions: UiLocaleCode[] = [...uiLocales];
  const decorationsCategoryDefinition = categoryDefinitions.find((item) => item.path === "decorations");
  const elementTypeIcons: Record<number, string> = {
    1: elementType1Icon,
    2: elementType2Icon,
    3: elementType3Icon,
    4: elementType4Icon,
    5: elementType5Icon,
    6: elementType6Icon,
    7: elementType7Icon,
    8: elementType8Icon,
    9: elementType9Icon,
  };

  let uiLocale: UiLocaleCode = "fr";
  let appView: AppView = "category";
  let selectedCategory: CategoryPath = "items";
  let themeMode: ThemeMode = "dark";

  let apiHealthStatus = "unknown";
  let gameVersion = "";

  let apiLanguages: LanguageOption[] = [];
  let sourceLang = "en";
  let targetLang = "fr";

  let tableRows: CategoryTableItem[] = [];
  let tableSearch = "";
  let pagination: TablePagination = { ...emptyPagination };
  let detailPreview: CategoryDetailData | null = null;

  let tableError: unknown = null;
  let buildError: unknown = null;
  let isInitializing = true;
  let isLoadingTable = false;
  let isLoadingDetailForKey: string | null = null;
  let isTranslatingBuild = false;

  let previousSourceLang = sourceLang;
  let previousTargetLang = targetLang;

  let buildUrl = "";
  let buildResult: LinkBuildTranslateResponse | null = null;
  let buildDecorationDetail: BuildDecorationDetailView | null = null;
  let inlineSkillPreviewKey: string | null = null;
  let inlineSkillPreviewLabel = "";
  let inlineSkillPreviewData: CategoryDetailData | null = null;
  let inlineSkillPreviewError: unknown = null;
  let inlineSkillLoadingKey: string | null = null;
  let detailSkillAssociatedJewels: string[] = [];
  let inlineSkillAssociatedJewels: string[] = [];

  $: t = getDictionary(uiLocale);
  $: activeCategory = categoryDefinitions.find((item) => item.path === selectedCategory) ?? categoryDefinitions[0];
  $: activeCategoryLabel = getLocalizedLabel(activeCategory.labels, uiLocale);
  $: buildLabel = getLocalizedLabel(buildTranslationLabels, uiLocale);
  $: activeViewLabel = appView === "build" ? buildLabel : activeCategoryLabel;
  $: sourceOption = apiLanguages.find((option) => option.code === sourceLang) ?? null;
  $: targetOption = apiLanguages.find((option) => option.code === targetLang) ?? null;
  $: sourceLangLabel = getLanguageDisplay(sourceLang, sourceOption?.label);
  $: targetLangLabel = getLanguageDisplay(targetLang, targetOption?.label);
  $: healthValue = apiHealthStatus === "unavailable" ? t.unavailable : apiHealthStatus;
  $: gameVersionValue = gameVersion || t.unavailable;
  $: themeToggleLabel = themeMode === "dark" ? t.switchToLight : t.switchToDark;
  $: normalizedSearch = tableSearch.trim().toLowerCase();
  $: filteredTableRows = normalizedSearch
    ? tableRows.filter((row) => matchesTableSearch(row, normalizedSearch))
    : tableRows;
  $: decorationsLabel = decorationsCategoryDefinition
    ? getLocalizedLabel(decorationsCategoryDefinition.labels, uiLocale)
    : "Decorations";
  $: associatedDecorationLabel = interpolate(t.associatedLabelTemplate, { label: decorationsLabel });
  $: weaponDetailView =
    detailPreview && selectedCategory === "weapons" ? buildWeaponDetailView(detailPreview) : null;
  $: armorDetailView = detailPreview && selectedCategory === "armor" ? buildArmorDetailView(detailPreview) : null;
  $: charmDetailView = detailPreview && selectedCategory === "charms" ? buildCharmDetailView(detailPreview) : null;
  $: decorationDetailView =
    detailPreview && selectedCategory === "decorations"
      ? buildDecorationDetailView(detailPreview)
      : null;
  $: kinsectDetailView =
    detailPreview && selectedCategory === "kinsects" ? buildKinsectDetailView(detailPreview) : null;
  $: detailSkillAssociatedJewels =
    detailPreview && selectedCategory === "skills" ? getAssociatedJewelNames(detailPreview) : [];
  $: inlineSkillAssociatedJewels =
    inlineSkillPreviewData ? getAssociatedJewelNames(inlineSkillPreviewData) : [];

  $: if (!isInitializing && sourceLang !== previousSourceLang) {
    previousSourceLang = sourceLang;
    if (appView === "category") {
      void loadCategoryTable(1);
    }
  }

  $: if (!isInitializing && targetLang !== previousTargetLang) {
    previousTargetLang = targetLang;
    if (appView === "category") {
      void loadCategoryTable(1);
    }
  }

  onMount(() => {
    themeMode = initializeTheme();
    void initializeDashboard();
  });

  function isUiLocaleCode(value: string): value is UiLocaleCode {
    return uiLocales.includes(value as UiLocaleCode);
  }

  function getLanguageDisplay(code: string, fallback?: string): string {
    const normalizedCode = code.toLowerCase();
    const localizedName = isUiLocaleCode(normalizedCode)
      ? t.languageNames[normalizedCode]
      : fallback ?? code;
    return `${getLanguageFlag(code)} ${localizedName}`;
  }

  function getUiLocaleLabel(code: UiLocaleCode): string {
    return `${getLanguageFlag(code)} ${t.languageNames[code]}`;
  }

  function formatError(error: unknown): string {
    return formatErrorMessage(error, t);
  }

  function getAssociatedJewels(skill: LinkBuildSkillTranslated): LinkBuildAssociatedJewel[] {
    return skill.associated_jewels ?? [];
  }

  function openBuildDecorationDetail(skill: LinkBuildSkillTranslated): void {
    const associatedJewels = getAssociatedJewels(skill);
    if (associatedJewels.length <= 1) {
      return;
    }

    buildDecorationDetail = {
      skillName: skill.name,
      originalText: skill.original_text,
      associatedJewels,
    };
  }

  function closeBuildDecorationDetail(): void {
    buildDecorationDetail = null;
  }

  function resetInlineSkillPreview(): void {
    inlineSkillPreviewKey = null;
    inlineSkillPreviewLabel = "";
    inlineSkillPreviewData = null;
    inlineSkillPreviewError = null;
    inlineSkillLoadingKey = null;
  }

  async function openInlineSkillPreview(skill: DetailSkillEntry): Promise<void> {
    if (!skill.externalKey) {
      return;
    }

    const requestKey = skill.externalKey;
    inlineSkillPreviewKey = requestKey;
    inlineSkillPreviewLabel = skill.name;
    inlineSkillPreviewData = null;
    inlineSkillPreviewError = null;
    inlineSkillLoadingKey = requestKey;

    try {
      const response = await apiClient.getCategoryDetail("skills", requestKey, targetLang);
      if (inlineSkillPreviewKey === requestKey) {
        inlineSkillPreviewData = response.data;
      }
    } catch (error) {
      if (inlineSkillPreviewKey === requestKey) {
        inlineSkillPreviewError = error;
      }
    } finally {
      if (inlineSkillLoadingKey === requestKey) {
        inlineSkillLoadingKey = null;
      }
    }
  }

  function closeInlineSkillPreview(): void {
    resetInlineSkillPreview();
  }

  function toggleTheme(): void {
    themeMode = applyTheme(themeMode === "dark" ? "light" : "dark");
  }

  function pickDefaultLanguage(options: LanguageOption[], preferredCode: string): string {
    const preferred = options.find((option) => option.code === preferredCode);
    if (preferred) {
      return preferred.code;
    }
    return options[0]?.code ?? preferredCode;
  }

  function pickTargetLanguage(options: LanguageOption[], preferredCode: string, sourceCode: string): string {
    const preferred = options.find(
      (option) => option.code === preferredCode && option.code !== sourceCode
    );
    if (preferred) {
      return preferred.code;
    }

    const fallback = options.find((option) => option.code !== sourceCode);
    return fallback?.code ?? sourceCode;
  }

  async function initializeDashboard(): Promise<void> {
    isInitializing = true;
    tableError = null;

    try {
      const [healthResponse, gameVersionResponse, languagesResponse] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getGameVersion().catch(() => null),
        apiClient.getLanguages(),
      ]);

      apiHealthStatus = healthResponse?.status ?? "unavailable";
      gameVersion = gameVersionResponse?.game_version ?? "";
      apiLanguages = languagesResponse.languages;

      sourceLang = pickDefaultLanguage(apiLanguages, "en");
      targetLang = pickTargetLanguage(apiLanguages, "fr", sourceLang);
      previousSourceLang = sourceLang;
      previousTargetLang = targetLang;

      await loadCategoryTable(1);
    } catch (error) {
      tableError = error;
    } finally {
      isInitializing = false;
    }
  }

  function openCategory(category: CategoryPath): void {
    appView = "category";
    tableSearch = "";
    detailPreview = null;
    resetInlineSkillPreview();
    buildDecorationDetail = null;
    if (selectedCategory === category) {
      return;
    }

    selectedCategory = category;
    void loadCategoryTable(1);
  }

  function openBuildTranslation(): void {
    appView = "build";
    detailPreview = null;
    resetInlineSkillPreview();
    tableError = null;
    buildDecorationDetail = null;
  }

  async function loadCategoryTable(page: number): Promise<void> {
    if (!sourceLang || !targetLang) {
      return;
    }

    isLoadingTable = true;
    tableError = null;
    detailPreview = null;
    resetInlineSkillPreview();

    try {
      const response = await apiClient.getCategoryTable(selectedCategory, {
        source_lang: sourceLang,
        target_lang: targetLang,
        page,
        limit: pageLimit,
      });

      tableRows = response.items;
      pagination = response.pagination;
    } catch (error) {
      tableRows = [];
      pagination = { ...emptyPagination, page };
      tableError = error;
    } finally {
      isLoadingTable = false;
    }
  }

  async function previewDetail(externalKey: string): Promise<void> {
    isLoadingDetailForKey = externalKey;
    detailPreview = null;
    resetInlineSkillPreview();
    tableError = null;

    try {
      const response = await apiClient.getCategoryDetail(selectedCategory, externalKey, targetLang);
      detailPreview = response.data;
    } catch (error) {
      tableError = error;
    } finally {
      isLoadingDetailForKey = null;
    }
  }

  function closeDetailPreview(): void {
    detailPreview = null;
    resetInlineSkillPreview();
  }

  async function translateBuildLink(): Promise<void> {
    const trimmed = buildUrl.trim();
    if (!trimmed) {
      buildError = new BackendApiError(400, "empty_build_url", "", null);
      return;
    }

    buildError = null;
    buildResult = null;
    buildDecorationDetail = null;
    isTranslatingBuild = true;

    try {
      buildResult = await apiClient.translateLinkBuild({
        url: trimmed,
        target_lang: targetLang,
      });
    } catch (error) {
      buildError = error;
    } finally {
      isTranslatingBuild = false;
    }
  }
</script>

<main class="min-h-screen bg-background text-foreground">
  <div class="mx-auto grid w-full max-w-[1500px] gap-4 p-4 md:h-dvh md:grid-cols-[280px_1fr]">
    <AppSidebar
      {logo}
      {t}
      bind:uiLocale
      {uiLocaleOptions}
      {getUiLocaleLabel}
      {apiHealthStatus}
      {healthValue}
      {gameVersionValue}
      {themeMode}
      {themeToggleLabel}
      {appView}
      {selectedCategory}
      {buildLabel}
      onToggleTheme={toggleTheme}
      onOpenCategory={openCategory}
      onOpenBuildTranslation={openBuildTranslation}
    />

    <section class="min-w-0 space-y-4 md:flex md:min-h-0 md:flex-col md:gap-4 md:space-y-0">
      <AppToolbarCard
        {appView}
        {activeViewLabel}
        {t}
        bind:sourceLang
        bind:targetLang
        {sourceLangLabel}
        {targetLangLabel}
        {apiLanguages}
        {getLanguageDisplay}
      />

      {#if appView === "category" && tableError}
        <Alert.Root variant="destructive" class="md:shrink-0">
          <Alert.Title>{t.apiErrorTitle}</Alert.Title>
          <Alert.Description>{formatError(tableError)}</Alert.Description>
        </Alert.Root>
      {/if}

      {#if appView === "category"}
        {#if detailPreview}
          <CategoryDetailPanel
            {t}
            {selectedCategory}
            {detailPreview}
            {inlineSkillPreviewKey}
            {inlineSkillPreviewLabel}
            {inlineSkillPreviewData}
            {inlineSkillPreviewError}
            {inlineSkillLoadingKey}
            {detailSkillAssociatedJewels}
            {inlineSkillAssociatedJewels}
            {weaponDetailView}
            {armorDetailView}
            {charmDetailView}
            {decorationDetailView}
            {kinsectDetailView}
            {elementTypeIcons}
            {formatDescription}
            {formatError}
            {formatSlotsDisplay}
            onCloseDetailPreview={closeDetailPreview}
            onCloseInlineSkillPreview={closeInlineSkillPreview}
            onOpenInlineSkillPreview={openInlineSkillPreview}
          />
        {:else}
          <CategoryTablePanel
            {t}
            bind:tableSearch
            {isInitializing}
            {isLoadingTable}
            {tableRows}
            {filteredTableRows}
            {pagination}
            {isLoadingDetailForKey}
            {formatDescription}
            onPreviewDetail={previewDetail}
            onLoadCategoryTable={loadCategoryTable}
          />
        {/if}
      {:else}
        <BuildTranslationPanel
          {t}
          bind:buildUrl
          {isTranslatingBuild}
          {buildError}
          {buildResult}
          {buildDecorationDetail}
          {associatedDecorationLabel}
          {formatError}
          onTranslateBuildLink={translateBuildLink}
          onOpenBuildDecorationDetail={openBuildDecorationDetail}
          onCloseBuildDecorationDetail={closeBuildDecorationDetail}
        />
      {/if}
    </section>
  </div>
</main>
