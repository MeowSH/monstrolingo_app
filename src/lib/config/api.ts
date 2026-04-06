export type ApiMode = "local" | "prod";

const apiBaseUrls: Record<ApiMode, string> = {
  local: "http://127.0.0.1:4000",
  prod: "/api",
};

// Switch this value when moving between local and production routing.
const apiMode: ApiMode = "local";

export const apiConfig = {
  mode: apiMode,
  baseUrl: apiBaseUrls[apiMode],
  baseUrls: apiBaseUrls,
};
