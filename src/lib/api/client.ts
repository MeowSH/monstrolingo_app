import type {
  BackendErrorPayload,
  CategoryDetailResponse,
  CategoryPath,
  CategoryTableQuery,
  CategoryTableResponse,
  GameVersionResponse,
  HealthResponse,
  LanguagesResponse,
  LinkBuildTranslateRequest,
  LinkBuildTranslateResponse,
} from "./types";
import { apiConfig } from "$lib/config/api";

const API_BASE_URL = apiConfig.baseUrl;

export class BackendApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function sanitizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function makeUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${sanitizePath(path)}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function defaultErrorCode(status: number): string {
  if (status === 400) return "invalid_argument";
  if (status === 404) return "not_found";
  return "internal";
}

async function parseErrorPayload(response: Response): Promise<BackendErrorPayload> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as Partial<BackendErrorPayload>;
    return {
      code: payload.code ?? defaultErrorCode(response.status),
      message: payload.message ?? "Backend request failed.",
      details: payload.details ?? null,
    };
  }

  const message = (await response.text()) || "Backend request failed.";
  return {
    code: defaultErrorCode(response.status),
    message,
    details: null,
  };
}

async function requestJson<T>(
  path: string,
  options?: RequestInit,
  query?: Record<string, string | number | undefined>
): Promise<T> {
  const response = await fetch(makeUrl(path, query), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new BackendApiError(response.status, errorPayload.code, errorPayload.message, errorPayload.details);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new BackendApiError(
      500,
      "internal",
      "Unexpected non-JSON response from backend.",
      { path, contentType }
    );
  }

  return (await response.json()) as T;
}

function validateLimit(limit: number): void {
  if (limit > 100) {
    throw new BackendApiError(400, "invalid_argument", "`limit` must be <= 100.", {
      limit,
    });
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  getHealth(): Promise<HealthResponse> {
    return requestJson<HealthResponse>("/health");
  },

  getLanguages(): Promise<LanguagesResponse> {
    return requestJson<LanguagesResponse>("/languages");
  },

  getGameVersion(): Promise<GameVersionResponse> {
    return requestJson<GameVersionResponse>("/game/version");
  },

  getCategoryTable(category: CategoryPath, query: CategoryTableQuery): Promise<CategoryTableResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    validateLimit(limit);

    return requestJson<CategoryTableResponse>(`/${category}/table`, undefined, {
      source_lang: query.source_lang,
      target_lang: query.target_lang,
      page,
      limit,
    });
  },

  getCategoryDetail(
    category: CategoryPath,
    externalKey: string,
    targetLang: string
  ): Promise<CategoryDetailResponse> {
    if (!targetLang) {
      throw new BackendApiError(400, "invalid_argument", "`target_lang` is required.", null);
    }

    return requestJson<CategoryDetailResponse>(
      `/${category}/detail/${encodeURIComponent(externalKey)}`,
      undefined,
      {
        target_lang: targetLang,
      }
    );
  },

  translateLinkBuild(payload: LinkBuildTranslateRequest): Promise<LinkBuildTranslateResponse> {
    return requestJson<LinkBuildTranslateResponse>("/linkbuild/translate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
