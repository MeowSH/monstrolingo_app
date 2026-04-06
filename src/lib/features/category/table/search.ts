import type { CategoryTableItem } from "$lib/api/types";

export function matchesTableSearch(row: CategoryTableItem, term: string): boolean {
  const searchableValues = [
    row.external_key,
    row.source.name,
    row.source.description ?? "",
    row.target.name,
    row.target.description ?? "",
  ];
  return searchableValues.some((value) => value.toLowerCase().includes(term));
}
