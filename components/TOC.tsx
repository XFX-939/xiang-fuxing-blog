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
        "rounded-md border border-ink-200 bg-white p-4 text-sm dark:border-ink-800 dark:bg-ink-950",
        compact ? "" : "sticky top-24"
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-500 dark:text-ink-400">
        TOC
      </p>
      <ol className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className="block leading-6 text-ink-600 transition hover:text-signal-700 dark:text-ink-300 dark:hover:text-signal-300"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
