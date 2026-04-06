<script lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { CategoryDetailData } from "$lib/api/types";
  import type { UiDictionary } from "$lib/i18n/dictionary";

  export let t: UiDictionary;
  export let inlineSkillPreviewKey: string | null = null;
  export let inlineSkillPreviewLabel = "";
  export let inlineSkillPreviewData: CategoryDetailData | null = null;
  export let inlineSkillPreviewError: unknown = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let inlineSkillAssociatedJewels: string[] = [];
  export let onClose: () => void;
  export let formatError: (error: unknown) => string;
  export let formatDescription: (value: string | null | undefined) => string;
</script>

{#if inlineSkillPreviewKey}
  <Card.Root class="category-detail-card">
    <Card.Header class="gap-2 pb-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={t.previous}
          title={t.previous}
          onclick={onClose}
        >
          <ChevronLeftIcon />
        </Button>
        <Card.Title class="category-section-title">{t.skillDetails}</Card.Title>
      </div>
      <Card.Description>{t.externalKey}: {inlineSkillPreviewKey}</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-2 text-sm">
      {#if inlineSkillLoadingKey === inlineSkillPreviewKey}
        <p class="text-muted-foreground">{t.loading}</p>
      {:else if inlineSkillPreviewError}
        <Alert.Root variant="destructive">
          <Alert.Title>{t.apiErrorTitle}</Alert.Title>
          <Alert.Description>{formatError(inlineSkillPreviewError)}</Alert.Description>
        </Alert.Root>
      {:else if inlineSkillPreviewData}
        <p>
          <span class="font-medium">{t.translatedName}:</span>
          {(inlineSkillPreviewData.translation?.name ?? inlineSkillPreviewLabel) || "-"}
        </p>
        <p>
          <span class="font-medium">{t.translatedDescription}:</span>
          {formatDescription(inlineSkillPreviewData.translation?.description)}
        </p>
        {#if inlineSkillAssociatedJewels.length > 0}
          <div class="space-y-2">
            <p class="font-medium">{t.associatedJewels}</p>
            <div class="flex flex-wrap gap-2">
              {#each inlineSkillAssociatedJewels as jewel, jewelIndex (`inline-skill-jewel-${jewelIndex}`)}
                <Badge variant="secondary">{jewel}</Badge>
              {/each}
            </div>
          </div>
        {/if}
      {:else}
        <p class="text-muted-foreground">{t.noSkillDetails}</p>
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
