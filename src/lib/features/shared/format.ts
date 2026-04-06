import { BackendApiError } from "$lib/api/client";

type ErrorDictionary = {
  apiErrorTitle: string;
  errors: {
    emptyBuildUrl: string;
    invalidArgument: string;
    notFound: string;
    internal: string;
    unknown: string;
  };
};

export function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function formatDescription(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "-";
}

export function formatError(error: unknown, t: ErrorDictionary): string {
  if (error instanceof BackendApiError) {
    if (error.code === "empty_build_url") {
      return t.errors.emptyBuildUrl;
    }
    if (error.code === "invalid_argument") {
      return t.errors.invalidArgument;
    }
    if (error.code === "not_found") {
      return t.errors.notFound;
    }
    if (error.code === "internal") {
      return t.errors.internal;
    }
    return error.message || `${t.apiErrorTitle} (${error.code})`;
  }

  if (error instanceof Error) {
    return error.message || t.errors.unknown;
  }

  return t.errors.unknown;
}
