"use client";

import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: Array<{ name: string; count: number }>;
  value: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="分类筛选">
      <button
        type="button"
        onClick={() => onChange("全部")}
        className={filterClass(value === "全部")}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category.name}
          type="button"
          onClick={() => onChange(category.name)}
          className={filterClass(value === category.name)}
        >
          {category.name}
          <span className={cn("ml-1", value === category.name ? "text-white/80" : "text-ink-400")}>
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function filterClass(active: boolean) {
  return cn(
    "rounded-md border px-3 py-2 text-sm font-medium transition",
    active
      ? "border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950"
      : "border-ink-200 bg-white text-ink-600 hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-300 dark:hover:border-signal-700 dark:hover:text-signal-300"
  );
}
