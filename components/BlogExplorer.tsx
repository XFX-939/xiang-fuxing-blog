"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { Tag } from "@/components/Tag";
import type { Post } from "@/lib/posts";

type BlogExplorerProps = {
  posts: Post[];
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  initialCategory?: string;
};

const pageSize = 6;

export function BlogExplorer({ posts, categories, tags, initialCategory = "全部" }: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState("全部");
  const [visible, setVisible] = useState(pageSize);
  const [showAllTags, setShowAllTags] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchCategory = category === "全部" || post.category === category;
      const matchTag = tag === "全部" || post.tags.includes(tag);
      const haystack = [post.title, post.description, post.category, post.searchText, ...post.tags]
        .join(" ")
        .toLowerCase();
      const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
      const matchQuery = queryTerms.length === 0 || queryTerms.every((term) => haystack.includes(term));

      return matchCategory && matchTag && matchQuery;
    });
  }, [category, posts, query, tag]);

  const visiblePosts = filteredPosts.slice(0, visible);
  const visibleTags = showAllTags ? tags : tags.slice(0, 12);
  const hiddenTagCount = Math.max(tags.length - visibleTags.length, 0);

  function resetAndSetCategory(nextCategory: string) {
    setCategory(nextCategory);
    setVisible(pageSize);
  }

  function resetAndSetTag(nextTag: string) {
    setTag(nextTag);
    setVisible(pageSize);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="space-y-4 lg:space-y-6">
        <div className="rounded-[18px] border border-ink-200 bg-white p-5 sm:rounded-md lg:p-4 dark:border-ink-800 dark:bg-ink-950">
          <p className="mb-3 text-sm font-semibold text-ink-950 dark:text-white">分类</p>
          <CategoryFilter categories={categories} value={category} onChange={resetAndSetCategory} />
        </div>
        <div className="rounded-[18px] border border-ink-200 bg-white p-5 sm:rounded-md lg:p-4 dark:border-ink-800 dark:bg-ink-950">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink-950 dark:text-white">标签</p>
            {hiddenTagCount > 0 || showAllTags ? (
              <button
                type="button"
                onClick={() => setShowAllTags((value) => !value)}
                className="text-xs font-semibold text-signal-700 hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100"
              >
                {showAllTags ? "收起标签" : `展开更多 ${hiddenTagCount}`}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => resetAndSetTag("全部")}
              className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-signal-700 dark:hover:text-signal-300"
            >
              全部
            </button>
            {visibleTags.map((item) => (
              <button key={item.name} type="button" onClick={() => resetAndSetTag(item.name)}>
                <Tag className={tag === item.name ? "border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950" : ""} count={item.count}>
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
            setQuery(value);
            setVisible(pageSize);
          }}
        />
        <div className="mt-4 text-sm text-ink-500 dark:text-ink-400">
          共找到 {filteredPosts.length} 篇文章
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5">
          {visiblePosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
        {visiblePosts.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-ink-300 p-8 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
            没有找到匹配的文章。
          </div>
        ) : null}
        <Pagination visible={visiblePosts.length} total={filteredPosts.length} onLoadMore={() => setVisible((value) => value + pageSize)} />
      </section>
    </div>
  );
}
