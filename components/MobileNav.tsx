"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/site";
import { topicHubs } from "@/lib/topics";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "关闭导航" : "打开导航"}
        title={open ? "关闭导航" : "打开导航"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-[9.25rem] z-50 rounded-md border border-ink-200 bg-white p-2 shadow-soft dark:border-ink-800 dark:bg-ink-950 dark:shadow-soft-dark">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 hover:text-signal-700 dark:text-ink-200 dark:hover:bg-ink-900 dark:hover:text-signal-300"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-ink-200 dark:border-ink-800" />
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">主题</p>
          {topicHubs.map((topic) => (
            <Link
              key={topic.slug}
              href={topic.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 hover:text-signal-700 dark:text-ink-200 dark:hover:bg-ink-900 dark:hover:text-signal-300"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
