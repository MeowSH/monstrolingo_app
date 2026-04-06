export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "monstrolingo-theme";

export function applyTheme(mode: ThemeMode): ThemeMode {
  document.documentElement.classList.toggle("dark", mode === "dark");

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors and keep runtime theme only.
  }

  return mode;
}

export function initializeTheme(): ThemeMode {
  let storedTheme: string | null = null;
  try {
    storedTheme = localStorage.getItem(STORAGE_KEY);
  } catch {
    storedTheme = null;
  }

  if (storedTheme === "light") {
    return applyTheme("light");
  }

  return applyTheme("dark");
}
