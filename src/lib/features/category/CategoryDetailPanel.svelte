<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { CategoryDetailData, CategoryPath } from "$lib/api/types";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import InlineSkillPreviewCard from "./detail/InlineSkillPreviewCard.svelte";
  import WeaponDetailCard from "./detail/WeaponDetailCard.svelte";
  import ArmorDetailCard from "./detail/ArmorDetailCard.svelte";
  import CharmDetailCard from "./detail/CharmDetailCard.svelte";
  import DecorationDetailCard from "./detail/DecorationDetailCard.svelte";
  import KinsectDetailCard from "./detail/KinsectDetailCard.svelte";
  import type {
    ArmorDetailView,
    CharmDetailView,
    DecorationDetailView,
    DetailSkillEntry,
    KinsectDetailView,
    WeaponDetailView,
  } from "./detail/types";

  export let t: UiDictionary;
  export let selectedCategory: CategoryPath;
  export let detailPreview: CategoryDetailData | null = null;
  export let inlineSkillPreviewKey: string | null = null;
  export let inlineSkillPreviewLabel = "";
  export let inlineSkillPreviewData: CategoryDetailData | null = null;
  export let inlineSkillPreviewError: unknown = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let detailSkillAssociatedJewels: string[] = [];
  export let inlineSkillAssociatedJewels: string[] = [];
  export let weaponDetailView: WeaponDetailView | null = null;
  export let armorDetailView: ArmorDetailView | null = null;
  export let charmDetailView: CharmDetailView | null = null;
  export let decorationDetailView: DecorationDetailView | null = null;
  export let kinsectDetailView: KinsectDetailView | null = null;
  export let elementTypeIcons: Record<number, string>;
  export let formatDescription: (value: string | null | undefined) => string;
  export let formatError: (error: unknown) => string;
  export let formatSlotsDisplay: (slots: number[]) => string;
  export let onCloseDetailPreview: () => void;
  export let onCloseInlineSkillPreview: () => void;
  export let onOpenInlineSkillPreview: (skill: DetailSkillEntry) => Promise<void>;
</script>

{#if detailPreview}
  <Card.Root class="md:min-h-0 md:flex-1">
    <Card.Header class="gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={t.previous}
          title={t.previous}
          onclick={onCloseDetailPreview}
        >
          <XIcon />
        </Button>
        <Card.Title class="text-lg leading-tight md:text-xl">{t.detailPreview}</Card.Title>
      </div>
      <Card.Description>{t.externalKey}: {detailPreview.external_key}</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4 text-sm md:overflow-auto">
      <div class="space-y-2">
        <p>
          <span class="font-medium">{t.translatedName}:</span>
          {detailPreview.translation?.name ?? "-"}
        </p>
        <p>
          <span class="font-medium">{t.translatedDescription}:</span>
          {formatDescription(detailPreview.translation?.description)}
        </p>
      </div>

      <InlineSkillPreviewCard
        {t}
        {inlineSkillPreviewKey}
        {inlineSkillPreviewLabel}
        {inlineSkillPreviewData}
        {inlineSkillPreviewError}
        {inlineSkillLoadingKey}
        {inlineSkillAssociatedJewels}
        onClose={onCloseInlineSkillPreview}
        {formatError}
        {formatDescription}
      />

      {#if selectedCategory === "skills" && detailSkillAssociatedJewels.length > 0}
        <Card.Root class="category-detail-card">
          <Card.Header class="pb-3">
            <Card.Title class="category-section-title">{t.associatedJewels}</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-2 text-sm">
            <div class="flex flex-wrap gap-2">
              {#each detailSkillAssociatedJewels as jewel, jewelIndex (`skill-jewel-${jewelIndex}`)}
                <Badge variant="secondary">{jewel}</Badge>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if selectedCategory === "weapons"}
        <WeaponDetailCard
          {t}
          {weaponDetailView}
          {inlineSkillLoadingKey}
          {elementTypeIcons}
          {formatSlotsDisplay}
          {onOpenInlineSkillPreview}
        />
      {/if}

      {#if selectedCategory === "armor"}
        <ArmorDetailCard
          {t}
          {armorDetailView}
          {inlineSkillLoadingKey}
          {elementTypeIcons}
          {formatSlotsDisplay}
          {onOpenInlineSkillPreview}
        />
      {/if}

      {#if selectedCategory === "charms"}
        <CharmDetailCard
          {t}
          {charmDetailView}
          {inlineSkillLoadingKey}
          {onOpenInlineSkillPreview}
        />
      {/if}

      {#if selectedCategory === "decorations"}
        <DecorationDetailCard
          {t}
          {decorationDetailView}
          {inlineSkillLoadingKey}
          {onOpenInlineSkillPreview}
        />
      {/if}

      {#if selectedCategory === "kinsects"}
        <KinsectDetailCard {t} {kinsectDetailView} />
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
