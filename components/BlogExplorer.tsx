"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Search, X } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import type { PostListItem } from "@/lib/posts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type BlogExplorerProps = {
  posts: PostListItem[];
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  initialCategory?: string;
};

const pageSize = 6;
const defaultTagLimit = 6;

export function BlogExplorer({ posts, categories, tags, initialCategory = "全部" }: BlogExplorerProps) {
  const explorerRef = useRef<HTMLDivElement>(null);
  const filterRailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState("全部");
  const [visible, setVisible] = useState(pageSize);
  const [showAllTags, setShowAllTags] = useState(false);
  const [searchPosts, setSearchPosts] = useState<PostListItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

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
  const visibleTags = showAllTags ? tags : tags.slice(0, defaultTagLimit);
  const hasHiddenTags = tags.length > defaultTagLimit;
  const motionKey = visiblePosts.map((post) => post.slug).join("|");
  const signalTopics = useMemo(() => {
    const topicNames = tags.slice(0, 10).map((item) => item.name);

    if (topicNames.length > 0) {
      return topicNames;
    }

    return categories.slice(0, 10).map((item) => item.name);
  }, [categories, tags]);

  useGSAP(
    () => {
      const scope = explorerRef.current;

      if (!scope) {
        return;
      }

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const signalTrack = scope.querySelector<HTMLElement>("[data-signal-track]");

        if (signalTrack) {
          gsap.to(signalTrack, {
            xPercent: -50,
            duration: 34,
            ease: "none",
            repeat: -1
          });
        }

        const rows = gsap.utils.toArray<HTMLElement>("[data-article-row]", scope);

        rows.forEach((row) => {
          const revealItems = row.querySelectorAll<HTMLElement>("[data-reveal]");

          gsap.fromTo(
            revealItems,
            { autoAlpha: 0.18, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.045,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 92%",
                end: "top 68%",
                scrub: 0.35
              }
            }
          );
        });
      });

      media.add("(min-width: 1024px)", () => {
        if (!filterRailRef.current) {
          return;
        }

        ScrollTrigger.create({
          trigger: scope,
          start: "top top+=104",
          end: "bottom bottom-=48",
          pin: filterRailRef.current,
          pinSpacing: false,
          invalidateOnRefresh: true
        });
      });

      return () => media.revert();
    },
    {
      scope: explorerRef,
      dependencies: [motionKey],
      revertOnUpdate: true
    }
  );

  function resetAndSetCategory(nextCategory: string) {
    setCategory(nextCategory);
    setVisible(pageSize);
  }

  function resetAndSetTag(nextTag: string) {
    setTag(nextTag);
    setVisible(pageSize);
  }

  return (
    <div ref={explorerRef}>
      {signalTopics.length > 0 ? (
        <div className="overflow-hidden border-y border-border py-2.5 sm:py-3" aria-label="研究主题流">
          <div data-signal-track className="flex w-max will-change-transform">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                aria-hidden={groupIndex === 1 ? "true" : undefined}
                className="flex shrink-0 items-center gap-4 pr-4 text-[11px] font-semibold tracking-[0.12em] text-muted sm:gap-8 sm:pr-8"
              >
                {signalTopics.map((topic) => (
                  <span key={`${groupIndex}-${topic}`} className="flex items-center gap-4 whitespace-nowrap sm:gap-8">
                    <span>{topic}</span>
                    <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside ref={filterRailRef} className="h-fit min-w-0" aria-label="文章筛选">
          <div className="border-t border-border pt-3 sm:pt-4">
            <div className="mb-2 flex items-center justify-between gap-4 sm:mb-3">
              <h2 className="text-xs font-semibold tracking-[0.12em] text-primary">分类检索</h2>
              <span className="font-mono text-[11px] tabular-nums text-muted">{posts.length}</span>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-hide sm:gap-4 sm:pb-2 lg:mx-0 lg:block lg:space-y-0 lg:overflow-visible lg:px-0 lg:pb-0">
              <button
                type="button"
                onClick={() => resetAndSetCategory("全部")}
                aria-pressed={category === "全部"}
                className={`flex shrink-0 items-center justify-between gap-4 border-b-2 px-0 py-1.5 text-left text-sm transition sm:py-2 lg:w-full lg:border-b lg:border-l-2 lg:px-3 lg:py-2.5 ${
                  category === "全部"
                    ? "border-accent font-semibold text-accent"
                    : "border-transparent text-secondary hover:text-accent lg:border-b-border lg:border-l-transparent"
                }`}
              >
                <span>全部</span>
                <span className="font-mono text-[11px] tabular-nums text-muted">{posts.length}</span>
              </button>
              {categories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => resetAndSetCategory(item.name)}
                  aria-pressed={category === item.name}
                  className={`flex shrink-0 items-center justify-between gap-4 border-b-2 px-0 py-1.5 text-left text-sm transition sm:py-2 lg:w-full lg:border-b lg:border-l-2 lg:px-3 lg:py-2.5 ${
                    category === item.name
                      ? "border-accent font-semibold text-accent"
                      : "border-transparent text-secondary hover:text-accent lg:border-b-border lg:border-l-transparent"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-3 sm:mt-8 sm:pt-4">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <h2 className="text-xs font-semibold tracking-[0.12em] text-primary">标签信号</h2>
              {hasHiddenTags ? (
                <button
                  type="button"
                  onClick={() => setShowAllTags((value) => !value)}
                  className="border-b border-transparent text-[11px] font-semibold text-accent transition hover:border-accent"
                >
                  {showAllTags ? "收起" : `展开 +${tags.length - defaultTagLimit}`}
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3">
              <button
                type="button"
                onClick={() => resetAndSetTag("全部")}
                aria-pressed={tag === "全部"}
                className={`border-b pb-0.5 text-xs transition ${
                  tag === "全部" ? "border-accent font-semibold text-accent" : "border-transparent text-muted hover:border-accent hover:text-accent"
                }`}
              >
                #全部
              </button>
              {visibleTags.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => resetAndSetTag(item.name)}
                  aria-pressed={tag === item.name}
                  className={`border-b pb-0.5 text-xs transition ${
                    tag === item.name ? "border-accent font-semibold text-accent" : "border-transparent text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  #{item.name} <span className="font-mono text-[10px]">{item.count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0" aria-labelledby="article-index-heading">
          <label className="group relative flex min-h-12 items-center border-y border-border transition focus-within:border-accent sm:min-h-14">
            <span className="sr-only">搜索文章</span>
            <Search className="pointer-events-none ml-1 h-4 w-4 shrink-0 text-muted transition group-focus-within:text-accent sm:ml-3" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(pageSize);
              }}
              placeholder="搜索标题、摘要、正文或标签"
              className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-primary outline-none placeholder:text-muted sm:h-14 sm:px-4 sm:text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mr-1 inline-flex h-9 w-9 items-center justify-center text-muted transition hover:bg-accent-soft hover:text-accent sm:mr-2"
                aria-label="清空搜索"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <div className="mt-6 flex items-end justify-between gap-6 border-b border-border pb-3 sm:mt-8 sm:pb-4">
            <div>
              <h2 id="article-index-heading" className="text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-3xl">
                文章索引
              </h2>
              <p className="mt-2 text-sm text-muted">
                {isSearching ? "正在扫描全文信号…" : hasQuery ? `“${normalizedQuery}” 找到 ${resultCount} 篇` : `当前范围 ${resultCount} 篇`}
              </p>
            </div>
            <span className="hidden font-mono text-xs tabular-nums text-muted sm:block">新 → 旧</span>
          </div>

          <div data-article-index className="border-t border-border">
            {visiblePosts.map((post, index) => (
              <ArticleCard key={post.slug} post={post} index={index + 1} />
            ))}
          </div>

          {visiblePosts.length === 0 ? (
            <div className="border-b border-border px-4 py-16 text-center text-sm leading-7 text-muted">
              没有找到匹配的文章。试试减少关键词，或切换分类与标签。
            </div>
          ) : null}

          {visiblePosts.length < filteredPosts.length ? (
            <div className="mt-6 border-y border-border py-3 text-center sm:mt-8">
              <button
                type="button"
                onClick={() => setVisible((value) => value + pageSize)}
                className="inline-flex min-h-11 items-center gap-3 px-5 text-sm font-semibold text-primary transition hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                继续读取
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
