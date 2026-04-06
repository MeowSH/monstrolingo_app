<script lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import GemIcon from "@lucide/svelte/icons/gem";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import type {
    LinkBuildAssociatedJewel,
    LinkBuildSkillTranslated,
    LinkBuildTranslateResponse,
  } from "$lib/api/types";
  import type { UiDictionary } from "$lib/i18n/dictionary";

  type BuildDecorationDetailView = {
    skillName: string;
    originalText: string;
    associatedJewels: LinkBuildAssociatedJewel[];
  };

  export let t: UiDictionary;
  export let buildUrl = "";
  export let isTranslatingBuild = false;
  export let buildError: unknown = null;
  export let buildResult: LinkBuildTranslateResponse | null = null;
  export let buildDecorationDetail: BuildDecorationDetailView | null = null;
  export let associatedDecorationLabel: string;
  export let formatError: (error: unknown) => string;
  export let onTranslateBuildLink: () => Promise<void>;
  export let onOpenBuildDecorationDetail: (skill: LinkBuildSkillTranslated) => void;
  export let onCloseBuildDecorationDetail: () => void;

  $: setSkillsTranslated = buildResult?.set_skills_translated ?? [];
  $: armorJewelSkillsTranslated =
    buildResult?.armor_jewel_skills_translated ?? buildResult?.skills_translated ?? [];

  function getAssociatedJewels(skill: LinkBuildSkillTranslated): LinkBuildAssociatedJewel[] {
    return skill.associated_jewels ?? [];
  }

  function getAssociatedJewelCount(skill: LinkBuildSkillTranslated): number {
    return getAssociatedJewels(skill).length;
  }

  function getSingleAssociatedJewelName(skill: LinkBuildSkillTranslated): string {
    return getAssociatedJewels(skill)[0]?.name ?? "-";
  }
</script>

<Card.Root class="md:min-h-0 md:flex-1">
  <Card.Header>
    <Card.Title>{t.buildTranslation}</Card.Title>
    <Card.Description>{t.buildDescription}</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-3 md:min-h-0 md:overflow-auto">
    <div class="flex flex-col gap-2 md:flex-row">
      <Input bind:value={buildUrl} placeholder={t.buildPlaceholder} class="w-full" />
      <Button onclick={() => void onTranslateBuildLink()} disabled={isTranslatingBuild}>
        {isTranslatingBuild ? t.translatingBuild : t.translateBuild}
      </Button>
    </div>

    {#if buildError}
      <Alert.Root variant="destructive">
        <Alert.Title>{t.buildErrorTitle}</Alert.Title>
        <Alert.Description>{formatError(buildError)}</Alert.Description>
      </Alert.Root>
    {/if}

    {#if buildResult}
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary">{t.sourceDetected}: {buildResult.source_lang_detected}</Badge>
          <Badge variant="secondary">{t.targetLang}: {buildResult.target_lang}</Badge>
          <Badge variant={buildResult.translation_mode === "full" ? "default" : "outline"}>
            {t.mode}: {buildResult.translation_mode}
          </Badge>
        </div>

        <div class="grid gap-3 md:grid-cols-2 lg:items-start">
          <Card.Root class="build-section-card">
            <Card.Header class="pb-3">
              <Card.Title class="build-section-title">{t.setSkillsSection}</Card.Title>
            </Card.Header>
            <Card.Content class="pt-0">
              <Table.Root class="mx-auto w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>{t.original}</Table.Head>
                    <Table.Head>{t.translated}</Table.Head>
                    <Table.Head>{t.level}</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if setSkillsTranslated.length === 0}
                    <Table.Row>
                      <Table.Cell colspan={3} class="text-muted-foreground text-center">
                        {t.noSetSkillsTranslated}
                      </Table.Cell>
                    </Table.Row>
                  {:else}
                    {#each setSkillsTranslated as row, rowIndex (`set-${row.original_text}-${rowIndex}`)}
                      <Table.Row>
                        <Table.Cell>{row.original_text}</Table.Cell>
                        <Table.Cell>{row.name}</Table.Cell>
                        <Table.Cell>{row.requested_level ?? "-"}</Table.Cell>
                      </Table.Row>
                    {/each}
                  {/if}
                </Table.Body>
              </Table.Root>
            </Card.Content>
          </Card.Root>

          {#if buildDecorationDetail}
            <Card.Root class="build-section-card">
              <Card.Header class="gap-2 pb-3">
                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label={t.previous}
                    title={t.previous}
                    onclick={onCloseBuildDecorationDetail}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Card.Title class="build-section-title">{associatedDecorationLabel}</Card.Title>
                </div>
                <Card.Description>
                  {buildDecorationDetail.originalText} - {buildDecorationDetail.skillName}
                </Card.Description>
              </Card.Header>
              <Card.Content class="space-y-2 text-sm">
                {#each buildDecorationDetail.associatedJewels as jewel, jewelIndex (`detail-${jewel.decoration_external_key}-${jewelIndex}`)}
                  <div class="rounded-md border border-border px-3 py-2">
                    <p class="font-medium">{jewel.name}</p>
                  </div>
                {/each}
              </Card.Content>
            </Card.Root>
          {:else}
            <Card.Root class="build-section-card">
              <Card.Header class="pb-3">
                <Card.Title class="build-section-title">{t.armorJewelSkillsSection}</Card.Title>
              </Card.Header>
              <Card.Content class="pt-0">
                <Table.Root class="mx-auto w-auto">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{t.original}</Table.Head>
                      <Table.Head>{t.translated}</Table.Head>
                      <Table.Head>{t.level}</Table.Head>
                      <Table.Head>{associatedDecorationLabel}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if armorJewelSkillsTranslated.length === 0}
                      <Table.Row>
                        <Table.Cell colspan={4} class="text-muted-foreground text-center">
                          {t.noArmorJewelSkillsTranslated}
                        </Table.Cell>
                      </Table.Row>
                    {:else}
                      {#each armorJewelSkillsTranslated as row, rowIndex (`armor-${row.original_text}-${rowIndex}`)}
                        <Table.Row>
                          <Table.Cell>{row.original_text}</Table.Cell>
                          <Table.Cell>{row.name}</Table.Cell>
                          <Table.Cell>{row.requested_level ?? "-"}</Table.Cell>
                          <Table.Cell class="max-w-[460px] whitespace-normal break-words">
                            {#if getAssociatedJewelCount(row) === 0}
                              -
                            {:else if getAssociatedJewelCount(row) === 1}
                              {getSingleAssociatedJewelName(row)}
                            {:else}
                              <Button
                                size="sm"
                                class="mx-auto w-[96%] justify-center gap-2"
                                variant="outline"
                                aria-label={`${associatedDecorationLabel} (x ${getAssociatedJewelCount(row)})`}
                                title={`${associatedDecorationLabel} (x ${getAssociatedJewelCount(row)})`}
                                onclick={() => onOpenBuildDecorationDetail(row)}
                              >
                                <GemIcon />
                                <span>x {getAssociatedJewelCount(row)}</span>
                              </Button>
                            {/if}
                          </Table.Cell>
                        </Table.Row>
                      {/each}
                    {/if}
                  </Table.Body>
                </Table.Root>
              </Card.Content>
            </Card.Root>
          {/if}
        </div>

        {#if buildResult.unmatched_elements.length > 0}
          <Card.Root class="build-section-card">
            <Card.Header class="pb-3">
              <Card.Title class="build-section-title">{t.unmatchedElements}</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2 text-sm">
              {#each buildResult.unmatched_elements as unmatched}
                <p class="text-muted-foreground">
                  {unmatched.value} - {unmatched.reason}
                </p>
              {/each}
            </Card.Content>
          </Card.Root>
        {/if}
      </div>
    {/if}
  </Card.Content>
</Card.Root>
