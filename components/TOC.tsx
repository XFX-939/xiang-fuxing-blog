import type { TocItem } from "@/lib/posts";
import { cn } from "@/lib/utils";

type TOCProps = {
  items: TocItem[];
  compact?: boolean;
};

export function TOC({ items, compact = false }: TOCProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="文章目录"
      className={cn(
        "rounded-md border border-border bg-surface p-4 text-sm",
        compact ? "" : "sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto"
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        目录
      </p>
      <ol className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className="block leading-6 text-secondary transition hover:text-accent"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
