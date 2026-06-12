import { createContext, useContext, useEffect, useState } from "react";

import { ThemeMode, ThemeName } from "@/query/types";

export const THEME_NAMES: ThemeName[] = [
  "lira",
  "quarter",
  "mark",
  "peso",
  "franc",
  "dinar",
];

const STORAGE_KEY = "koin-theme";

interface StoredTheme {
  name: ThemeName;
  mode: ThemeMode;
}

function readStorage(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredTheme;
  } catch {
    // ignore
  }
  return { name: "lira", mode: "dark" };
}

function writeStorage(theme: StoredTheme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultName?: ThemeName;
  defaultMode?: ThemeMode;
};

type ThemeProviderState = {
  themeName: ThemeName;
  themeMode: ThemeMode;
  setThemeName: (name: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (name: ThemeName, mode: ThemeMode) => void;
};

const initialState: ThemeProviderState = {
  themeName: "lira",
  themeMode: "dark",
  setThemeName: () => null,
  setThemeMode: () => null,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function applyTheme(name: ThemeName, mode: ThemeMode) {
  const root = window.document.documentElement;
  root.setAttribute("data-theme", name);
  root.classList.remove("light", "dark");
  root.classList.add(mode);
}

export function ThemeProvider({
  children,
  defaultName,
  defaultMode,
  ...props
}: ThemeProviderProps) {
  const stored = readStorage();

  const [themeName, setThemeNameState] = useState<ThemeName>(
    defaultName ?? stored.name
  );
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    defaultMode ?? stored.mode
  );

  useEffect(() => {
    applyTheme(themeName, themeMode);
  }, [themeName, themeMode]);

  const setThemeName = (name: ThemeName) => {
    writeStorage({ name, mode: themeMode });
    setThemeNameState(name);
  };

  const setThemeMode = (mode: ThemeMode) => {
    writeStorage({ name: themeName, mode });
    setThemeModeState(mode);
  };

  const setTheme = (name: ThemeName, mode: ThemeMode) => {
    writeStorage({ name, mode });
    setThemeNameState(name);
    setThemeModeState(mode);
  };

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{ themeName, themeMode, setThemeName, setThemeMode, setTheme }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
