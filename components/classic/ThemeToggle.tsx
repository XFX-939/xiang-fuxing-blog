"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme ?? "system" : "system";
  const resolved = mounted ? resolvedTheme ?? "light" : "light";
  const Icon = resolved === "dark" ? Sun : Moon;
  const label =
    currentTheme === "system"
      ? `系统主题，当前显示${resolved === "dark" ? "深色" : "浅色"}`
      : resolved === "dark"
        ? "深色模式"
        : "浅色模式";

  function toggleTheme() {
    setTheme(resolved === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      aria-label={mounted ? `切换主题，当前为${label}` : "切换主题"}
      title={mounted ? `切换主题，当前为${label}` : "切换主题"}
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-secondary transition hover:border-accent hover:text-accent"
    >
      {mounted ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
