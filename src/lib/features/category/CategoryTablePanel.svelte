<script lang="ts">
  import InfoIcon from "@lucide/svelte/icons/info";
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import type { CategoryTableItem, TablePagination } from "$lib/api/types";
  import type { UiDictionary } from "$lib/i18n/dictionary";
  import { interpolate } from "$lib/features/shared/format";

  export let t: UiDictionary;
  export let tableSearch = "";
  export let isInitializing = false;
  export let isLoadingTable = false;
  export let tableRows: CategoryTableItem[] = [];
  export let filteredTableRows: CategoryTableItem[] = [];
  export let pagination: TablePagination;
  export let isLoadingDetailForKey: string | null = null;
  export let formatDescription: (value: string | null | undefined) => string;
  export let onPreviewDetail: (externalKey: string) => Promise<void>;
  export let onLoadCategoryTable: (page: number) => Promise<void>;
</script>

<Card.Root class="md:min-h-0 md:flex-1">
  <Card.Content class="space-y-4 p-4 md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-4 md:space-y-0 md:p-6">
    <div class="space-y-2 md:shrink-0">
      <p class="text-muted-foreground text-xs font-medium">{t.search}</p>
      <Input bind:value={tableSearch} placeholder={t.searchPlaceholder} class="w-full" />
    </div>

    <div class="md:min-h-0 md:flex-1 md:overflow-auto">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>{t.source}</Table.Head>
            <Table.Head>{t.target}</Table.Head>
            <Table.Head>{t.targetDescription}</Table.Head>
            <Table.Head class="pr-5 text-right">{t.detail}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if isInitializing || isLoadingTable}
            <Table.Row>
              <Table.Cell colspan={4} class="text-muted-foreground text-center">
                {t.loadingTranslations}
              </Table.Cell>
            </Table.Row>
          {:else if tableRows.length === 0}
            <Table.Row>
              <Table.Cell colspan={4} class="text-muted-foreground text-center">
                {t.noRows}
              </Table.Cell>
            </Table.Row>
          {:else if filteredTableRows.length === 0}
            <Table.Row>
              <Table.Cell colspan={4} class="text-muted-foreground text-center">
                {t.noSearchResults}
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each filteredTableRows as row (row.external_key)}
              <Table.Row>
                <Table.Cell>{row.source.name}</Table.Cell>
                <Table.Cell>{row.target.name}</Table.Cell>
                <Table.Cell class="max-w-[340px] truncate">
                  {formatDescription(row.target.description)}
                </Table.Cell>
                <Table.Cell class="pr-5 text-right">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label={isLoadingDetailForKey === row.external_key ? t.loading : t.detail}
                    title={isLoadingDetailForKey === row.external_key ? t.loading : t.detail}
                    onclick={() => void onPreviewDetail(row.external_key)}
                    disabled={isLoadingDetailForKey === row.external_key}
                  >
                    {#if isLoadingDetailForKey === row.external_key}
                      <LoaderCircleIcon class="animate-spin" />
                    {:else}
                      <InfoIcon />
                    {/if}
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 md:shrink-0">
      <p class="text-muted-foreground text-xs">
        {interpolate(t.pageSummary, {
          page: pagination.page,
          totalPages: Math.max(1, pagination.total_pages),
          total: pagination.total,
        })}
      </p>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pagination.page <= 1 || isLoadingTable}
          onclick={() => void onLoadCategoryTable(pagination.page - 1)}
        >
          {t.previous}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pagination.has_next || isLoadingTable}
          onclick={() => void onLoadCategoryTable(pagination.page + 1)}
        >
          {t.next}
        </Button>
      </div>
    </div>
  </Card.Content>
</Card.Root>
