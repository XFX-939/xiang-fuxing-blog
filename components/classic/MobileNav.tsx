"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/classic/NavLink";
import { navItems } from "@/lib/site";
import { topicHubs } from "@/lib/topics";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "关闭导航" : "打开导航"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        title={open ? "关闭导航" : "打开导航"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </button>

      {open ? (
        <nav id="mobile-navigation" aria-label="移动导航" className="classic-mobile-nav-panel fixed inset-x-4 top-[9.625rem] z-50 max-h-[calc(100dvh_-_10.625rem_-_env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain rounded-md border border-border bg-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-soft sm:top-[9.375rem] sm:max-h-[calc(100dvh_-_10.375rem_-_env(safe-area-inset-bottom))] dark:shadow-soft-dark">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              variant="mobile"
              onClick={() => setOpen(false)}
            />
          ))}
          <div className="my-2 border-t border-border" />
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">主题</p>
          {topicHubs.map((topic) => (
            <Link
              key={topic.slug}
              href={topic.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-secondary transition hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              {topic.title}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
