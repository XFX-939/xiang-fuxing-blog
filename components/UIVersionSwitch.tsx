"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type UIVersion = "classic" | "signal";

type UIVersionSwitchProps = {
  active: UIVersion;
  className?: string;
  tone?: "paper" | "ink";
};

const SIGNAL_PREFIX = "/signal-preview";
const UI_COOKIE_NAME = "xfx-ui";
const SIGNAL_COOKIE_VALUE = "signal-v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function toCanonicalPath(pathname: string) {
  if (pathname === SIGNAL_PREFIX || pathname === `${SIGNAL_PREFIX}/`) {
    return "/";
  }

  if (pathname.startsWith(`${SIGNAL_PREFIX}/`)) {
    return pathname.slice(SIGNAL_PREFIX.length) || "/";
  }

  return pathname || "/";
}

function buildSwitchHref(pathname: string, target: UIVersion, search = "", hash = "") {
  const params = new URLSearchParams(search);
  params.delete("ui");
  params.set("ui", target);
  const query = params.toString();

  return `${toCanonicalPath(pathname)}${query ? `?${query}` : ""}${hash}`;
}

function buildCanonicalHref(pathname: string, search = "", hash = "") {
  const params = new URLSearchParams(search);
  params.delete("ui");
  const query = params.toString();

  return `${toCanonicalPath(pathname)}${query ? `?${query}` : ""}${hash}`;
}

export function UIVersionSwitch({ active, className, tone = "paper" }: UIVersionSwitchProps) {
  const pathname = usePathname();
  const target: UIVersion = active === "signal" ? "classic" : "signal";
  const [href, setHref] = useState(`?ui=${target}`);

  useEffect(() => {
    setHref(
      buildSwitchHref(
        window.location.pathname,
        target,
        window.location.search,
        window.location.hash
      )
    );
  }, [pathname, target]);

  const isSignal = active === "signal";
  const isClassicTone = active === "classic" && tone === "paper";
  const label = isSignal ? "切换到经典版界面" : "体验新版界面";

  function handleSwitch(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie =
      target === "signal"
        ? `${UI_COOKIE_NAME}=${SIGNAL_COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
        : `${UI_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;

    window.location.assign(
      buildCanonicalHref(
        window.location.pathname,
        window.location.search,
        window.location.hash
      )
    );
  }

  return (
    <a
      href={href}
      onClick={handleSwitch}
      aria-label={label}
      title={label}
      className={cn(
        "group inline-flex h-10 shrink-0 items-center border font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isClassicTone
          ? "border-border bg-surface text-secondary hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:ring-accent focus-visible:ring-offset-bg"
          : tone === "ink"
            ? "border-white/25 text-[#d8d3c8] hover:border-[#ff7043] hover:bg-[#ff7043] hover:text-[#111820] focus-visible:ring-[#f15a29] focus-visible:ring-offset-[#111a22]"
            : "border-[#171816]/25 text-[#4f514b] hover:border-[#171816] hover:bg-[#171816] hover:text-[#f3eee4] focus-visible:ring-[#f15a29] focus-visible:ring-offset-[#f3eee4] dark:border-white/20 dark:text-[#c8c5bb] dark:hover:border-[#f3eee4] dark:hover:bg-[#f3eee4] dark:hover:text-[#111820] dark:focus-visible:ring-offset-[#0d141b]",
        className
      )}
    >
      <span
        className={cn(
          "flex h-full items-center border-r px-2.5",
          isClassicTone
            ? "border-border text-accent"
            : tone === "ink"
              ? "border-white/20 text-[#ff8a63]"
              : "border-[#171816]/20 text-[#f15a29] dark:border-white/20 dark:text-[#ff8a63]"
        )}
      >
        {isSignal ? "新版" : "旧版"}
      </span>
      <span className="px-2.5">{isSignal ? "回旧版" : "看新版"}</span>
    </a>
  );
}
