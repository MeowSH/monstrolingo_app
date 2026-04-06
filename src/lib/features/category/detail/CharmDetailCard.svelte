<script lang="ts">
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { CharmDetailView, DetailSkillEntry } from "./types";

  export let t: UiDictionary;
  export let charmDetailView: CharmDetailView | null = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let onOpenInlineSkillPreview: (skill: DetailSkillEntry) => Promise<void>;
</script>

{#if charmDetailView}
  <Card.Root class="category-detail-card">
    <Card.Header class="pb-3">
      <Card.Title class="category-section-title">{t.charmDetailsSection}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-3 text-sm">
      <p>
        <span class="font-medium">{t.maxRank}:</span>
        {charmDetailView.maxRank}
      </p>

      <div class="space-y-2">
        <p class="font-medium">{t.associatedSkills}</p>
        {#if charmDetailView.associatedSkills.length === 0}
          <p class="text-muted-foreground">{t.noAssociatedSkills}</p>
        {:else}
          <div class="space-y-2">
            {#each charmDetailView.associatedSkills as skill, skillIndex (`charm-${skill.externalKey ?? skill.name}-${skillIndex}`)}
              <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <div class="min-w-0">
                  <p class="font-medium">{skill.name}</p>
                  {#if skill.level}
                    <p class="text-muted-foreground text-xs">{t.level}: {skill.level}</p>
                  {/if}
                </div>
                {#if skill.externalKey}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={inlineSkillLoadingKey === skill.externalKey}
                    onclick={() => void onOpenInlineSkillPreview(skill)}
                  >
                    {#if inlineSkillLoadingKey === skill.externalKey}
                      <LoaderCircleIcon class="animate-spin" />
                    {/if}
                    {t.skillDetails}
                  </Button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>
{/if}
