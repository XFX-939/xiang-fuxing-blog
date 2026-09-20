"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/classic/ArticleCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { Tag } from "@/components/classic/Tag";
import type { PostListItem } from "@/lib/posts";

type BlogExplorerProps = {
  posts: PostListItem[];
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  initialCategory?: string;
  initialTag?: string;
  initialQuery?: string;
};

const pageSize = 6;

export function BlogExplorer({
  posts,
  categories,
  tags,
  initialCategory = "全部",
  initialTag = "全部",
  initialQuery = ""
}: BlogExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [visible, setVisible] = useState(pageSize);
  const [showAllTags, setShowAllTags] = useState(false);
  const [searchPosts, setSearchPosts] = useState<PostListItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const queryEditingRef = useRef(false);
  const queryHistoryTimerRef = useRef<number | null>(null);

  function writeUrl(next: { category?: string; tag?: string; query?: string }, mode: "push" | "replace") {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = next.category ?? category;
    const nextTag = next.tag ?? tag;
    const nextQuery = next.query ?? query;

    if (nextCategory === "全部") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    if (nextTag === "全部") {
      params.delete("tag");
    } else {
      params.set("tag", nextTag);
    }

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl === currentUrl) {
      return;
    }

    window.history[mode === "push" ? "pushState" : "replaceState"](window.history.state, "", nextUrl);
  }

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCategory(params.get("category") || "全部");
      setTag(params.get("tag") || "全部");
      setQuery(params.get("q") || "");
      queryEditingRef.current = false;
      setVisible(pageSize);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (queryHistoryTimerRef.current !== null) {
        window.clearTimeout(queryHistoryTimerRef.current);
      }
    };
  }, []);

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setSearchPosts([]);
      setSearchTotal(0);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchPosts([]);
      setSearchTotal(0);

      const params = new URLSearchParams({ q: normalizedQuery });
      if (category !== "全部") {
        params.set("category", category);
      }
      if (tag !== "全部") {
        params.set("tag", tag);
      }

      try {
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { posts: PostListItem[]; total: number };
        setSearchPosts(data.posts);
        setSearchTotal(data.total);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchPosts([]);
          setSearchTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, hasQuery, normalizedQuery, tag]);

  const filteredPosts = useMemo(() => {
    if (hasQuery) {
      return searchPosts;
    }

    return posts.filter((post) => {
      const matchCategory = category === "全部" || post.category === category;
      const matchTag = tag === "全部" || post.tags.includes(tag);

      return matchCategory && matchTag;
    });
  }, [category, hasQuery, posts, searchPosts, tag]);

  const visiblePosts = filteredPosts.slice(0, visible);
  const resultCount = hasQuery ? searchTotal : filteredPosts.length;
  const visibleTags = showAllTags ? tags : tags.slice(0, 12);
  const hiddenTagCount = Math.max(tags.length - visibleTags.length, 0);

  function resetAndSetCategory(nextCategory: string) {
    setCategory(nextCategory);
    writeUrl({ category: nextCategory }, "push");
    setVisible(pageSize);
  }

  function resetAndSetTag(nextTag: string) {
    setTag(nextTag);
    writeUrl({ tag: nextTag }, "push");
    setVisible(pageSize);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="space-y-4 lg:space-y-6">
        <div className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md lg:p-4">
          <p className="mb-3 text-sm font-semibold text-primary">分类</p>
          <CategoryFilter categories={categories} value={category} onChange={resetAndSetCategory} />
        </div>
        <div className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md lg:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-primary">标签</p>
            {hiddenTagCount > 0 || showAllTags ? (
              <button
                type="button"
                onClick={() => setShowAllTags((value) => !value)}
                className="text-xs font-semibold text-accent hover:opacity-80"
              >
                {showAllTags ? "收起标签" : `展开更多 ${hiddenTagCount}`}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => resetAndSetTag("全部")}
              aria-pressed={tag === "全部"}
              className={
                tag === "全部"
                  ? "rounded-md border border-accent bg-accent px-2.5 py-1 text-xs font-medium text-white transition dark:text-bg"
                  : "rounded-md border border-border bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-text transition hover:border-accent hover:text-accent"
              }
            >
              全部
            </button>
            {visibleTags.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => resetAndSetTag(item.name)}
                aria-pressed={tag === item.name}
              >
                <Tag className={tag === item.name ? "border-accent bg-accent text-white dark:text-bg" : ""} count={item.count}>
                  {item.name}
                </Tag>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <SearchBox
          value={query}
          onChange={(value) => {
            if (!queryEditingRef.current) {
              window.history.pushState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
              queryEditingRef.current = true;
            }
            setQuery(value);
            writeUrl({ query: value }, "replace");
            setVisible(pageSize);
            if (queryHistoryTimerRef.current !== null) {
              window.clearTimeout(queryHistoryTimerRef.current);
            }
            queryHistoryTimerRef.current = window.setTimeout(() => {
              queryEditingRef.current = false;
              queryHistoryTimerRef.current = null;
            }, 700);
          }}
        />
        <div className="mt-4 text-sm text-muted">
          {isSearching ? "正在全文搜索..." : `共找到 ${resultCount} 篇文章`}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5">
          {visiblePosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
        {visiblePosts.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-border p-8 text-center text-sm text-muted">
            没有找到匹配的文章。
          </div>
        ) : null}
        <Pagination visible={visiblePosts.length} total={filteredPosts.length} onLoadMore={() => setVisible((value) => value + pageSize)} />
      </section>
    </div>
  );
}
