"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md text-sm font-medium leading-none transition",
        variant === "desktop"
          ? "whitespace-nowrap px-3 py-2 text-secondary hover:bg-accent-soft hover:text-primary"
          : "block px-3 py-2 text-secondary hover:bg-accent-soft hover:text-accent",
        active && "bg-accent-soft text-accent"
      )}
    >
      {label}
    </Link>
  );
}
