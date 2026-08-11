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
    <ol className="grid gap-0">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className={cn(
              "-ml-[17px] grid grid-cols-[2rem_minmax(0,1fr)] border-l-2 border-transparent py-2 pl-4 pr-1 text-secondary transition hover:border-accent/50 hover:text-accent",
              item.depth === 3 && "pl-7 text-[13px]",
              activeId === item.id && "border-accent font-semibold text-accent"
            )}
          >
            <span className="pt-0.5 font-mono text-[10px] font-medium tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="leading-6">{item.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  if (collapsible) {
    return (
      <details
        className={cn(
          "group border-y border-border bg-surface/95 px-1 py-3 text-sm backdrop-blur-xl",
          className
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold tracking-[0.12em] text-primary marker:hidden">
          <span>阅读导航</span>
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
        "border-l border-border pl-4 text-sm",
        compact && "pl-3",
        className
      )}
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.12em] text-primary">阅读导航</p>
        <span className="font-mono text-[10px] tabular-nums text-muted">{items.length}</span>
      </div>
      {list}
    </nav>
  );
}
