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
      aria-pressed={mounted ? resolved === "dark" : undefined}
      onClick={toggleTheme}
      className="group inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#171816]/25 bg-transparent text-[#2d5d7f] transition-colors duration-200 hover:border-[#171816] hover:bg-[#171816] hover:text-[#f3eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f15a29] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3eee4] dark:border-white/20 dark:text-[#9abbd0] dark:hover:border-[#f3eee4] dark:hover:bg-[#f3eee4] dark:hover:text-[#111820] dark:focus-visible:ring-offset-[#0d141b]"
    >
      {mounted ? (
        <Icon className="h-[17px] w-[17px] transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
      ) : (
        <span className="h-[17px] w-[17px]" aria-hidden="true" />
      )}
    </button>
  );
}
