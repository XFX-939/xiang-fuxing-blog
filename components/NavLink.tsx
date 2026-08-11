"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
};

function normalizePath(path: string) {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/$/, "");
}

function isActivePath(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  if (target === "/") {
    return current === "/";
  }

  if (target === "/blog") {
    return current === "/blog" || current.startsWith("/blog/") || current.startsWith("/tags") || current.startsWith("/categories") || current.startsWith("/topics");
  }

  return current === target || current.startsWith(`${target}/`);
}

export function NavLink({ href, label, variant = "desktop", onClick }: NavLinkProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rewrites expose the internal preview path to the server while the browser
  // keeps the canonical path. Wait until hydration before marking the active
  // link so both initial renders stay identical.
  const active = mounted && isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative text-sm font-semibold transition-colors duration-200 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f15a29]",
        variant === "desktop"
          ? "inline-flex h-full items-center border-b-2 border-transparent px-2.5 text-[#4f514b] hover:border-[#2d5d7f]/35 hover:text-[#2d5d7f] focus-visible:ring-inset dark:text-[#b9b6ad] dark:hover:border-[#8db4cc]/50 dark:hover:text-[#f3eee4] 2xl:px-3.5"
          : "flex min-h-12 items-center justify-between border-b border-white/15 px-1 py-3 text-[#d8d3c8] hover:border-[#f15a29] hover:text-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111a22]",
        active &&
          (variant === "desktop"
            ? "border-[#f15a29] text-[#171816] dark:border-[#ff7043] dark:text-white"
            : "border-[#f15a29] pl-4 text-white before:absolute before:left-0 before:h-5 before:w-0.5 before:bg-[#f15a29]")
      )}
    >
      <span>{label}</span>
      {variant === "mobile" ? (
        <span className={cn("font-mono text-[10px] tracking-[0.18em]", active ? "text-[#ff8a63]" : "text-[#7f98aa]")} aria-hidden="true">
          {active ? "CURRENT" : "OPEN"}
        </span>
      ) : null}
    </Link>
  );
}
