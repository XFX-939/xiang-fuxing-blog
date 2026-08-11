"use client";

import type { TocItem } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { useActiveHeading } from "@/components/useActiveHeading";

type TOCProps = {
  items: TocItem[];
  compact?: boolean;
  collapsible?: boolean;
  className?: string;
};

export function TOC({ items, compact = false, collapsible = false, className }: TOCProps) {
  const activeId = useActiveHeading(items);

  if (items.length === 0) {
    return null;
  }

  const list = (
    <ol className="grid gap-2">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className={cn(
              "block rounded-sm border-l-2 border-transparent px-2 py-1 leading-6 text-secondary transition hover:border-accent/60 hover:bg-accent-soft hover:text-accent",
              activeId === item.id && "border-accent bg-accent-soft font-semibold text-accent"
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (collapsible) {
    return (
      <details
        className={cn(
          "group rounded-md border border-border bg-surface/95 p-3 text-sm shadow-sm backdrop-blur-xl",
          className
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted marker:hidden">
          <span>目录</span>
          <span className="text-[11px] font-medium normal-case tracking-normal text-accent group-open:hidden">
            展开
          </span>
          <span className="hidden text-[11px] font-medium normal-case tracking-normal text-accent group-open:inline">
            收起
          </span>
        </summary>
        <div className="mt-3 max-h-[45vh] overflow-y-auto pr-1">{list}</div>
      </details>
    );
  }

  return (
    <nav
      aria-label="文章目录"
      className={cn(
        "rounded-md border border-border bg-surface p-4 text-sm",
        compact ? "p-3" : "",
        className
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        目录
      </p>
      {list}
    </nav>
  );
}
