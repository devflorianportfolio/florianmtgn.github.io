import { createContext, useContext, useEffect, useState } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  canToggle: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { config, isLoading } = useSiteConfig();
  const [theme, setThemeState] = useState<Theme>("light");
  const [canToggle, setCanToggle] = useState(true);

  useEffect(() => {
    if (isLoading || !config) return;
    const allowToggle = config.theme_mode === 'both' && config.allow_theme_switch;
    setCanToggle(allowToggle);
    let initialTheme: Theme;
    if (config.theme_mode === 'light') {
      initialTheme = 'light';
    } else if (config.theme_mode === 'dark') {
      initialTheme = 'dark';
    } else {
      if (allowToggle) {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        initialTheme = savedTheme || config.default_theme;
      } else {
        initialTheme = config.default_theme;
      }
    }
    setThemeState(initialTheme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
  }, [config, isLoading]);

  const setTheme = (newTheme: Theme) => {
    if (!canToggle) return;

    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, canToggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};