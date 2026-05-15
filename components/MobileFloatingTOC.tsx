"use client";

import { useEffect, useState } from "react";
import { ListTree, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveHeading } from "@/components/useActiveHeading";

type TocItem = {
  id: string;
  text: string;
  depth: number;
};

type MobileFloatingTOCProps = {
  items: TocItem[];
};

export function MobileFloatingTOC({ items }: MobileFloatingTOCProps) {
  const [open, setOpen] = useState(false);
  const activeId = useActiveHeading(items);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开文章目录"
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface/95 px-4 py-2.5 text-sm font-semibold text-primary shadow-soft backdrop-blur-xl transition",
          "hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft dark:shadow-soft-dark",
          open && "pointer-events-none opacity-0"
        )}
      >
        <ListTree className="h-4 w-4 text-accent" />
        <span>目录</span>
        {activeItem ? (
          <span className="max-w-[9rem] truncate border-l border-border pl-2 text-xs font-medium text-muted">
            {activeItem.text}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="文章目录">
          <button
            type="button"
            aria-label="关闭文章目录"
            className="absolute inset-0 bg-bg/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-3 bottom-3 overflow-hidden rounded-[18px] border border-border bg-surface shadow-soft dark:shadow-soft-dark">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">TOC</p>
                <h2 className="mt-1 text-base font-semibold text-primary">文章目录</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭目录"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="max-h-[58vh] overflow-y-auto px-3 py-3" aria-label="移动端文章目录">
              <ol className="grid gap-2">
                {items.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={activeId === item.id ? "location" : undefined}
                      className={cn(
                        "block rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-sm leading-6 text-secondary transition hover:border-accent hover:text-accent",
                        item.depth === 2 && "font-semibold text-primary",
                        activeId === item.id && "border-accent bg-accent-soft text-accent"
                      )}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
