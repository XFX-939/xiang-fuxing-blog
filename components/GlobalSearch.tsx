"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { PostListItem } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

type GlobalSearchProps = {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
};

const quickTerms = ["仿真", "5G", "AI Coding", "资源分配"];

export function GlobalSearch({
  className = "",
  placeholder = "搜索仿真、5G、AI Coding...",
  onNavigate
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<PostListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const panelId = useId();

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

        if (!response.ok) {
          throw new Error("Search request failed");
        }

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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d5d7f] dark:text-[#8db4cc]" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setFocused(false);
              event.currentTarget.blur();
            }
          }}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={showPanel}
          aria-controls={showPanel ? panelId : undefined}
          placeholder={placeholder}
          className="h-10 w-full border border-[#171816]/25 bg-[#e8e0d3] pl-9 pr-9 text-sm font-medium text-[#171816] outline-none transition-colors placeholder:font-normal placeholder:text-[#686b65] hover:border-[#2d5d7f]/70 focus:border-[#f15a29] focus:bg-[#faf6ed] focus:ring-2 focus:ring-[#f15a29]/20 dark:border-white/20 dark:bg-[#17232d] dark:text-[#f3eee4] dark:placeholder:text-[#8998a2] dark:hover:border-[#8db4cc]/70 dark:focus:border-[#ff7043] dark:focus:bg-[#101820] dark:focus:ring-[#ff7043]/20"
        />
        {query ? (
          <button
            type="button"
            aria-label="清空搜索"
            title="清空搜索"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setQuery("")}
            className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#686b65] transition-colors hover:bg-[#171816] hover:text-[#f3eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f15a29] dark:text-[#98a6af] dark:hover:bg-[#f3eee4] dark:hover:text-[#111820]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </label>

      {showPanel ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="搜索建议与结果"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 min-w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-[#171816]/25 border-t-2 border-t-[#f15a29] bg-[#faf6ed] text-[#171816] dark:border-white/20 dark:border-t-[#ff7043] dark:bg-[#111a22] dark:text-[#f3eee4] sm:min-w-0"
        >
          {normalizedQuery.length === 0 ? (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-5 bg-[#f15a29]" aria-hidden="true" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2d5d7f] dark:text-[#8db4cc]">快速检索</p>
              </div>
              <div className="grid grid-cols-2 border-l border-t border-[#171816]/15 dark:border-white/15">
                {quickTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setQuery(term)}
                    className="border-b border-r border-[#171816]/15 px-3 py-2.5 text-left text-xs font-semibold text-[#4f514b] transition-colors hover:bg-[#2d5d7f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f15a29] dark:border-white/15 dark:text-[#d8d3c8] dark:hover:bg-[#8db4cc] dark:hover:text-[#111820]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex items-center gap-3 p-4 text-sm text-[#686b65] dark:text-[#9aa6ad]" role="status" aria-live="polite">
              <span className="h-2 w-2 animate-pulse bg-[#f15a29]" aria-hidden="true" />
              正在全文搜索...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {results.map((post) => (
                <Link
                  key={post.url}
                  href={post.url}
                  onClick={onNavigate}
                  className="group block border-b border-[#171816]/15 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[#e8e0d3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f15a29] dark:border-white/15 dark:hover:bg-[#172630]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#667887] dark:text-[#8fa5b3]">
                        {post.category} · {formatDate(post.date)}
                      </p>
                      <p className="mt-1.5 text-sm font-bold leading-6 text-[#171816] transition-colors group-hover:text-[#2d5d7f] dark:text-[#f3eee4] dark:group-hover:text-[#9bc1d8]">
                        {post.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#686b65] dark:text-[#9aa6ad]">
                        {post.description}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#f15a29] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-[#686b65] dark:text-[#9aa6ad]" role="status" aria-live="polite">
              没有找到匹配文章。
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
