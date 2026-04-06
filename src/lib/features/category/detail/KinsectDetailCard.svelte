<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { KinsectDetailView } from "./types";

  export let t: UiDictionary;
  export let kinsectDetailView: KinsectDetailView | null = null;
</script>

{#if kinsectDetailView}
  <Card.Root class="category-detail-card">
    <Card.Header class="pb-3">
      <Card.Title class="category-section-title">{t.kinsectDetailsSection}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-3 text-sm">
      <p>
        <span class="font-medium">{t.attackType}:</span>
        {kinsectDetailView.attackType}
      </p>
      <p>
        <span class="font-medium">{t.powderType}:</span>
        {kinsectDetailView.powderType}
      </p>

      <div class="space-y-2">
        <p class="font-medium">{t.bonuses}</p>
        {#if kinsectDetailView.bonuses.length === 0}
          <p class="text-muted-foreground">{t.noBonuses}</p>
        {:else}
          <div class="space-y-2">
            {#each kinsectDetailView.bonuses as bonus, bonusIndex (`kinsect-bonus-${bonusIndex}`)}
              <div class="rounded-md border border-border px-3 py-2">
                {bonus}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>
{/if}
