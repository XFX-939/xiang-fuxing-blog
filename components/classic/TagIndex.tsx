"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Tag } from "@/components/classic/Tag";

type TagIndexProps = {
  tags: Array<{ name: string; count: number }>;
};

export function TagIndex({ tags }: TagIndexProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const popularTags = tags.slice(0, 18);
  const remainingTags = tags.slice(18);
  const filteredTags = useMemo(
    () => (normalizedQuery ? tags.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery)) : []),
    [normalizedQuery, tags]
  );

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">搜索标签</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标签"
          className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-base text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft sm:text-sm"
        />
      </label>

      {normalizedQuery ? (
        <div className="rounded-md border border-border bg-surface p-5" aria-live="polite">
          <p className="mb-3 text-sm text-muted">找到 {filteredTags.length} 个标签</p>
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag) => (
              <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count}>
                {tag.name}
              </Tag>
            ))}
          </div>
          {filteredTags.length === 0 ? <p className="text-sm text-muted">没有匹配的标签。</p> : null}
        </div>
      ) : (
        <>
          <section className="rounded-md border border-border bg-surface p-5" aria-labelledby="popular-tags-title">
            <h2 id="popular-tags-title" className="mb-3 text-base font-semibold text-primary">常用标签</h2>
            <div className="flex flex-wrap gap-3">
              {popularTags.map((tag) => (
                <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          </section>
          {remainingTags.length > 0 ? (
            <details className="rounded-md border border-border bg-surface">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                <span>更多标签</span>
                <span className="text-sm font-normal text-muted">{remainingTags.length} 个</span>
              </summary>
              <div className="flex flex-wrap gap-3 border-t border-border p-5">
                {remainingTags.map((tag) => (
                  <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count}>
                    {tag.name}
                  </Tag>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
