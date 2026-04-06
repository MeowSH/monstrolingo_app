<script lang="ts">
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { DetailSkillEntry, WeaponDetailView } from "./types";

  export let t: UiDictionary;
  export let weaponDetailView: WeaponDetailView | null = null;
  export let inlineSkillLoadingKey: string | null = null;
  export let elementTypeIcons: Record<number, string>;
  export let formatSlotsDisplay: (slots: number[]) => string;
  export let onOpenInlineSkillPreview: (skill: DetailSkillEntry) => Promise<void>;
</script>

{#if weaponDetailView}
  <Card.Root class="category-detail-card">
    <Card.Header class="pb-3">
      <Card.Title class="category-section-title">{t.weaponDetailsSection}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-3 text-sm">
      <p>
        <span class="font-medium">{t.weaponSlots}:</span>
        {formatSlotsDisplay(weaponDetailView.slots)}
      </p>
      <p>
        <span class="font-medium">{t.attack}:</span>
        {weaponDetailView.attack}
      </p>
      {#if weaponDetailView.elementValueNumber !== null && weaponDetailView.elementValueNumber > 0}
        <p class="flex flex-wrap items-center gap-2">
          <span class="font-medium">{t.elementalAttack}:</span>
          {#if weaponDetailView.elementTypeId !== null}
            <img
              src={elementTypeIcons[weaponDetailView.elementTypeId]}
              alt={weaponDetailView.elementTypeLabel}
              class="h-5 w-5"
            />
          {/if}
          <span>{weaponDetailView.elementValue}</span>
        </p>
      {/if}

      <div class="space-y-2">
        <p class="font-medium">{t.associatedSkills}</p>
        {#if weaponDetailView.associatedSkills.length === 0}
          <p class="text-muted-foreground">{t.noAssociatedSkills}</p>
        {:else}
          <div class="space-y-2">
            {#each weaponDetailView.associatedSkills as skill, skillIndex (`weapon-${skill.externalKey ?? skill.name}-${skillIndex}`)}
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
