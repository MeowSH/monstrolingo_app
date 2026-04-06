<script lang="ts">
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { ArmorDetailView, DetailSkillEntry } from "./types";

  export let t: UiDictionary;
  export let armorDetailView: ArmorDetailView | null = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let elementTypeIcons: Record<number, string>;
  export let formatSlotsDisplay: (slots: number[]) => string;
  export let onOpenInlineSkillPreview: (skill: DetailSkillEntry) => Promise<void>;
</script>

{#if armorDetailView}
  <Card.Root class="category-detail-card">
    <Card.Header class="pb-3">
      <Card.Title class="category-section-title">{t.armorDetailsSection}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-3 text-sm">
      <p>
        <span class="font-medium">{t.baseDefense}:</span>
        {armorDetailView.baseDefense}
      </p>

      <div class="space-y-2">
        <p class="font-medium">{t.elementalDefenses}</p>
        <div class="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span class="inline-flex items-center gap-1">
            <img src={elementTypeIcons[1]} alt={t.fireElement} class="h-5 w-5 shrink-0" />
            <span>{armorDetailView.elementalDefenses.fire}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <img src={elementTypeIcons[2]} alt={t.waterElement} class="h-5 w-5 shrink-0" />
            <span>{armorDetailView.elementalDefenses.water}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <img src={elementTypeIcons[3]} alt={t.thunderElement} class="h-5 w-5 shrink-0" />
            <span>{armorDetailView.elementalDefenses.thunder}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <img src={elementTypeIcons[4]} alt={t.iceElement} class="h-5 w-5 shrink-0" />
            <span>{armorDetailView.elementalDefenses.ice}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <img src={elementTypeIcons[5]} alt={t.dragonElement} class="h-5 w-5 shrink-0" />
            <span>{armorDetailView.elementalDefenses.dragon}</span>
          </span>
        </div>
      </div>

      <div class="space-y-2">
        <p class="font-medium">{t.armorSlots}</p>
        <p>{formatSlotsDisplay(armorDetailView.slots)}</p>
      </div>

      <div class="space-y-2">
        <p class="font-medium">{t.associatedSkills}</p>
        {#if armorDetailView.associatedSkills.length === 0}
          <p class="text-muted-foreground">{t.noAssociatedSkills}</p>
        {:else}
          <div class="space-y-2">
            {#each armorDetailView.associatedSkills as skill, skillIndex (`armor-skill-${skill.externalKey ?? skill.name}-${skillIndex}`)}
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

      {#if armorDetailView.setSkills.length > 0}
        <div class="space-y-2">
          <p class="font-medium">{t.setSkills}</p>
          <div class="space-y-2">
            {#each armorDetailView.setSkills as skill, skillIndex (`armor-set-${skill.externalKey ?? skill.name}-${skillIndex}`)}
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
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
