"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PostListItem } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

type GlobalSearchProps = {
  className?: string;
  placeholder?: string;
};

const quickTerms = ["仿真", "5G", "AI Coding", "资源分配"];

export function GlobalSearch({ className = "", placeholder = "搜索仿真、5G、AI Coding..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<PostListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!normalizedQuery) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const params = new URLSearchParams({ q: normalizedQuery, limit: "6" });
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { posts: PostListItem[] };
        setResults(data.posts);
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 160);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  const showPanel = focused && (normalizedQuery.length > 0 || query.length === 0);

  return (
    <div className={`relative ${className}`}>
      <label className="relative block">
        <span className="sr-only">全站搜索</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-9 text-sm text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft sm:h-10"
        />
        {query ? (
          <button
            type="button"
            aria-label="清空搜索"
            title="清空搜索"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-accent-soft hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-md border border-border bg-surface shadow-soft dark:shadow-soft-dark">
          {normalizedQuery.length === 0 ? (
            <div className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Quick Search</p>
              <div className="flex flex-wrap gap-2">
                {quickTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setQuery(term)}
                    className="rounded-md border border-border bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-text transition hover:border-accent hover:text-accent"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-4 text-sm text-muted">正在全文搜索...</div>
          ) : results.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {results.map((post) => (
                <Link
                  key={post.url}
                  href={post.url}
                  className="group block rounded-md px-3 py-3 transition hover:bg-surface-elevated"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted">
                        {post.category} · {formatDate(post.date)}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-primary group-hover:text-accent">
                        {post.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                        {post.description}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:text-accent" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted">没有找到匹配文章。</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
