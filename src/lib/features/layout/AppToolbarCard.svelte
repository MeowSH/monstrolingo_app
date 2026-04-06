<script lang="ts">
  import type { LanguageOption } from "$lib/api/types";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";

  export let appView: "category" | "build";
  export let activeViewLabel: string;
  export let t: UiDictionary;
  export let sourceLang: string;
  export let targetLang: string;
  export let sourceLangLabel: string;
  export let targetLangLabel: string;
  export let apiLanguages: LanguageOption[] = [];
  export let getLanguageDisplay: (code: string, fallback?: string) => string;
</script>

<Card.Root class="md:sticky md:top-4 md:z-20 md:shrink-0">
  <Card.Header class="gap-1">
    <Card.Title class="text-2xl font-semibold leading-tight md:text-3xl">{activeViewLabel}</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    {#if appView === "build"}
      <div class="space-y-2 md:max-w-sm">
        <p class="text-muted-foreground text-xs font-medium">{t.targetLanguage}</p>
        <Select.Root type="single" bind:value={targetLang}>
          <Select.Trigger class="w-full">{targetLangLabel}</Select.Trigger>
          <Select.Content>
            {#each apiLanguages as option (option.code)}
              <Select.Item value={option.code} label={getLanguageDisplay(option.code, option.label)}>
                {getLanguageDisplay(option.code, option.label)}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    {:else}
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-2">
          <p class="text-muted-foreground text-xs font-medium">{t.sourceLanguage}</p>
          <Select.Root type="single" bind:value={sourceLang}>
            <Select.Trigger class="w-full">{sourceLangLabel}</Select.Trigger>
            <Select.Content>
              {#each apiLanguages as option (option.code)}
                <Select.Item value={option.code} label={getLanguageDisplay(option.code, option.label)}>
                  {getLanguageDisplay(option.code, option.label)}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <p class="text-muted-foreground text-xs font-medium">{t.targetLanguage}</p>
          <Select.Root type="single" bind:value={targetLang}>
            <Select.Trigger class="w-full">{targetLangLabel}</Select.Trigger>
            <Select.Content>
              {#each apiLanguages as option (option.code)}
                <Select.Item value={option.code} label={getLanguageDisplay(option.code, option.label)}>
                  {getLanguageDisplay(option.code, option.label)}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
