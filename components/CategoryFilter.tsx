"use client";

import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: Array<{ name: string; count: number }>;
  value: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0" aria-label="分类筛选">
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
          <span className={cn("ml-1", value === category.name ? "text-white/80 dark:text-bg" : "text-muted")}>
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function filterClass(active: boolean) {
  return cn(
    "shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition",
    active
      ? "border-accent bg-accent text-white dark:text-bg"
      : "border-border bg-surface text-secondary hover:border-accent hover:text-accent"
  );
}
