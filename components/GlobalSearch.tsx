"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

type SearchPost = Pick<Post, "title" | "description" | "category" | "tags" | "url" | "searchText" | "date">;

type GlobalSearchProps = {
  posts: SearchPost[];
  className?: string;
  placeholder?: string;
};

const quickTerms = ["仿真", "5G", "AI Coding", "资源分配"];

export function GlobalSearch({ posts, className = "", placeholder = "搜索：仿真、5G、AI Coding、资源分配" }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      return [];
    }

    return posts
      .map((post) => {
        const haystack = [post.title, post.description, post.category, post.searchText, ...post.tags]
          .join(" ")
          .toLowerCase();
        const matched = terms.filter((term) => haystack.includes(term)).length;

        return { post, matched };
      })
      .filter((item) => item.matched === terms.length)
      .slice(0, 6);
  }, [normalizedQuery, posts]);

  const showPanel = focused && (normalizedQuery.length > 0 || query.length === 0);

  return (
    <div className={`relative ${className}`}>
      <label className="relative block">
        <span className="sr-only">全站搜索</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-ink-200 bg-white/90 pl-9 pr-9 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-signal-400 focus:ring-4 focus:ring-signal-100 dark:border-ink-800 dark:bg-ink-950/90 dark:text-white dark:focus:border-signal-600 dark:focus:ring-signal-950"
        />
        {query ? (
          <button
            type="button"
            aria-label="清空搜索"
            title="清空搜索"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-900 dark:hover:text-ink-200"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-md border border-ink-200 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-950 dark:shadow-soft-dark">
          {normalizedQuery.length === 0 ? (
            <div className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Quick Search</p>
              <div className="flex flex-wrap gap-2">
                {quickTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setQuery(term)}
                    className="rounded-md border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-signal-700 dark:hover:text-signal-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {results.map(({ post }) => (
                <Link
                  key={post.url}
                  href={post.url}
                  className="group block rounded-md px-3 py-3 transition hover:bg-ink-50 dark:hover:bg-ink-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink-500 dark:text-ink-400">
                        {post.category} · {formatDate(post.date)}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-950 group-hover:text-signal-700 dark:text-white dark:group-hover:text-signal-300">
                        {post.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500 dark:text-ink-400">
                        {post.description}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition group-hover:text-signal-600" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-ink-500 dark:text-ink-400">没有找到匹配文章。</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
