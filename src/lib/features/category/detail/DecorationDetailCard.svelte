<script lang="ts">
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { DecorationDetailView, DetailSkillEntry } from "./types";

  export let t: UiDictionary;
  export let decorationDetailView: DecorationDetailView | null = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let onOpenInlineSkillPreview: (skill: DetailSkillEntry) => Promise<void>;
</script>

{#if decorationDetailView}
  <Card.Root class="category-detail-card">
    <Card.Header class="pb-3">
      <Card.Title class="category-section-title">{t.decorationDetailsSection}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2 text-sm">
      <p class="font-medium">{t.associatedSkills}</p>
      {#if decorationDetailView.associatedSkills.length === 0}
        <p class="text-muted-foreground">{t.noAssociatedSkills}</p>
      {:else}
        <div class="space-y-2">
          {#each decorationDetailView.associatedSkills as skill, skillIndex (`decoration-${skill.externalKey ?? skill.name}-${skillIndex}`)}
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
    </Card.Content>
  </Card.Root>
{/if}
