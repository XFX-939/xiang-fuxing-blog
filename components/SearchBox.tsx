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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft sm:h-11"
      />
    </label>
  );
}
