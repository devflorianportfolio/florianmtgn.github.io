import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const ThemeToggle = ({ siteConfig = null }) => {
  const [theme, setTheme] = useState("light");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (siteConfig && !siteConfig.allow_theme_switch) {
      setIsVisible(false);
      const configTheme = siteConfig.theme_mode === 'both' 
        ? siteConfig.default_theme 
        : siteConfig.theme_mode;
      setTheme(configTheme);
      document.documentElement.classList.toggle("dark", configTheme === "dark");
      return;
    }

    if (siteConfig && siteConfig.theme_mode !== 'both') {
      setIsVisible(false);
      const forcedTheme = siteConfig.theme_mode;
      setTheme(forcedTheme);
      document.documentElement.classList.toggle("dark", forcedTheme === "dark");
      return;
    }

    setIsVisible(true);
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const defaultTheme = siteConfig?.default_theme || "light";
    const initialTheme = savedTheme || defaultTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, [siteConfig]);

  const toggleTheme = () => {
    if (!isVisible) return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </Button>
  );
};