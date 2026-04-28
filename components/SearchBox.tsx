"use client";

import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBox({ value, onChange, placeholder = "搜索标题、摘要、正文或标签" }: SearchBoxProps) {
  return (
    <label className="relative block">
      <span className="sr-only">搜索文章</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-signal-400 focus:ring-4 focus:ring-signal-100 dark:border-ink-800 dark:bg-ink-950 dark:text-white dark:focus:border-signal-600 dark:focus:ring-signal-950"
      />
    </label>
  );
}
