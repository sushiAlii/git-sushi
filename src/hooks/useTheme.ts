import { useCallback, useState } from "react";

export type ThemeMode = "light" | "dark";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(
    () => (document.documentElement.getAttribute("data-mode") as ThemeMode) ?? "light",
  );

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-mode", next);
      localStorage.setItem("mode", next);
      return next;
    });
  }, []);

  return { mode, toggle };
}
