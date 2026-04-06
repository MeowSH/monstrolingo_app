<script lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faGithub } from "@fortawesome/free-brands-svg-icons";
  import BugIcon from "@lucide/svelte/icons/bug";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { categoryDefinitions, getLocalizedLabel } from "$lib/i18n/categories";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import type { UiLocaleCode } from "$lib/i18n/locale";
  import type { CategoryPath } from "$lib/api/types";
  import type { ThemeMode } from "$lib/features/shared/theme";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";

  const repositoryUrl = "https://github.com/MeowSH/monstrolingo_app";
  const issuesUrl = "https://github.com/MeowSH/monstrolingo_app/issues";

  export let logo: string;
  export let t: UiDictionary;
  export let uiLocale: UiLocaleCode;
  export let uiLocaleOptions: UiLocaleCode[] = [];
  export let getUiLocaleLabel: (code: UiLocaleCode) => string;
  export let apiHealthStatus: string;
  export let healthValue: string;
  export let gameVersionValue: string;
  export let themeMode: ThemeMode;
  export let themeToggleLabel: string;
  export let appView: "category" | "build";
  export let selectedCategory: CategoryPath;
  export let buildLabel: string;
  export let onToggleTheme: () => void;
  export let onOpenCategory: (category: CategoryPath) => void;
  export let onOpenBuildTranslation: () => void;
</script>

<aside class="space-y-4 md:min-h-0 md:overflow-auto">
  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-3">
        <img src={logo} alt="Monstrolingo" class="h-14 w-14 rounded-xl" />
        <Card.Title class="text-xl font-semibold leading-none md:text-2xl">Monstrolingo</Card.Title>
      </div>
    </Card.Header>
    <Card.Content class="space-y-2">
      <p class="text-muted-foreground text-xs font-medium">{t.uiLanguage}</p>
      <Select.Root type="single" bind:value={uiLocale}>
        <Select.Trigger class="w-full">{getUiLocaleLabel(uiLocale)}</Select.Trigger>
        <Select.Content>
          {#each uiLocaleOptions as option (option)}
            <Select.Item value={option} label={getUiLocaleLabel(option)}>
              {getUiLocaleLabel(option)}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <Badge variant={apiHealthStatus === "ok" ? "default" : "secondary"}>
            {t.health}: {healthValue}
          </Badge>
          <Badge variant="secondary">
            {t.gameVersion}: {gameVersionValue}
          </Badge>
        </div>
        <Button
          size="icon-sm"
          variant="outline"
          class="shrink-0 self-center"
          onclick={onToggleTheme}
          aria-label={themeToggleLabel}
          title={themeToggleLabel}
        >
          {#if themeMode === "dark"}
            <SunIcon />
          {:else}
            <MoonIcon />
          {/if}
        </Button>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>{t.categories}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
      {#each categoryDefinitions as category (category.path)}
        <Button
          class="w-full justify-start"
          variant={appView === "category" && selectedCategory === category.path ? "default" : "outline"}
          onclick={() => onOpenCategory(category.path)}
        >
          {getLocalizedLabel(category.labels, uiLocale)}
        </Button>
      {/each}
      <Button
        class="w-full justify-start"
        variant={appView === "build" ? "default" : "outline"}
        onclick={onOpenBuildTranslation}
      >
        {buildLabel}
      </Button>
    </Card.Content>
  </Card.Root>

  <div class="border-t border-border pt-4">
    <p class="text-muted-foreground text-center text-xs font-medium">MeowSH 2026</p>
    <div class="mt-3 flex items-center justify-center gap-2">
      <Button
        href={repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="icon-sm"
        variant="outline"
        aria-label="GitHub repository"
        title="GitHub repository"
      >
        <FontAwesomeIcon icon={faGithub} />
      </Button>
      <Button
        href={issuesUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="icon-sm"
        variant="outline"
        aria-label="Report a bug"
        title="Report a bug"
      >
        <BugIcon />
      </Button>
    </div>
  </div>
</aside>
