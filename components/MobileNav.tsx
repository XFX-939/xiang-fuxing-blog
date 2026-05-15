"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { navItems } from "@/lib/site";
import { topicHubs } from "@/lib/topics";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "关闭导航" : "打开导航"}
        title={open ? "关闭导航" : "打开导航"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-secondary"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-[9.25rem] z-50 rounded-md border border-border bg-surface p-2 shadow-soft dark:shadow-soft-dark">
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
              className="block rounded-md px-3 py-2 text-sm font-medium text-secondary transition hover:bg-accent-soft hover:text-accent"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
