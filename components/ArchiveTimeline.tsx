"use client";

import Link from "next/link";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Tag } from "@/components/Tag";
import { cn, formatDate } from "@/lib/utils";

type ArchivePost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  url: string;
};

type ArchiveMonth = {
  key: string;
  year: string;
  month: string;
  label: string;
  posts: ArchivePost[];
};

export type ArchiveYearGroup = {
  year: string;
  count: number;
  months: ArchiveMonth[];
};

type ArchiveTimelineProps = {
  yearGroups: ArchiveYearGroup[];
};

export function ArchiveTimeline({ yearGroups }: ArchiveTimelineProps) {
  const allYearKeys = useMemo(() => yearGroups.map((group) => group.year), [yearGroups]);
  const allMonthKeys = useMemo(() => yearGroups.flatMap((group) => group.months.map((month) => month.key)), [yearGroups]);
  const [openYears, setOpenYears] = useState<Set<string>>(() => new Set(allYearKeys));
  const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set(allMonthKeys));
  const allExpanded = openYears.size === allYearKeys.length && openMonths.size === allMonthKeys.length;

  function toggleYear(year: string) {
    setOpenYears((current) => {
      const next = new Set(current);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }

  function toggleMonth(monthKey: string) {
    setOpenMonths((current) => {
      const next = new Set(current);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  }

  function expandAll() {
    setOpenYears(new Set(allYearKeys));
    setOpenMonths(new Set(allMonthKeys));
  }

  function collapseAll() {
    setOpenYears(new Set());
    setOpenMonths(new Set());
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-col gap-3 rounded-md border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-950 dark:text-white">时间轴视图</p>
          <p className="mt-1 text-sm leading-6 text-ink-500 dark:text-ink-400">支持按年份、月份折叠，适合快速扫读文章脉络。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-signal-700 dark:hover:text-signal-300"
          >
            <ChevronsUpDown className="h-4 w-4" />
            全部展开
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-signal-700 dark:hover:text-signal-300"
          >
            <ChevronsDownUp className="h-4 w-4" />
            全部折叠
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute bottom-2 left-4 top-2 w-px bg-gradient-to-b from-transparent via-ink-300 to-transparent dark:via-ink-700 sm:left-5" aria-hidden="true" />

        <div className="space-y-12">
          {yearGroups.map((yearGroup) => {
            const yearOpen = openYears.has(yearGroup.year);

            return (
              <section key={yearGroup.year} className="space-y-6">
                <div className="relative pl-12 sm:pl-16">
                  <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-signal-300 bg-white shadow-sm ring-4 ring-signal-50 dark:border-signal-700 dark:bg-ink-950 dark:ring-signal-950/40" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-signal-600 dark:bg-signal-300" />
                  </span>
                  <div className="flex flex-col gap-3 border-b border-ink-200 pb-4 dark:border-ink-800 sm:flex-row sm:items-end sm:justify-between">
                    <button
                      type="button"
                      aria-expanded={yearOpen}
                      onClick={() => toggleYear(yearGroup.year)}
                      className="group inline-flex w-fit items-center gap-3 text-left"
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">Year</span>
                        <span className="mt-1 block text-3xl font-semibold tracking-normal text-ink-950 transition group-hover:text-signal-800 dark:text-white dark:group-hover:text-signal-300">
                          {yearGroup.year}
                        </span>
                      </span>
                      <ChevronDown className={cn("mt-6 h-5 w-5 text-ink-400 transition group-hover:text-signal-600 dark:group-hover:text-signal-300", yearOpen ? "rotate-0" : "-rotate-90")} />
                    </button>
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      {yearGroup.months.length} 个月 · {yearGroup.count} 篇文章
                    </p>
                  </div>
                </div>

                {yearOpen ? (
                  <div className="space-y-6">
                    {yearGroup.months.map((group) => {
                      const monthOpen = openMonths.has(group.key);

                      return (
                        <section key={group.key} className="space-y-3">
                          <div className="relative pl-12 sm:pl-16">
                            <span className="absolute left-2 top-5 h-4 w-4 rounded-full border border-signal-300 bg-signal-50 dark:border-signal-800 dark:bg-signal-950" aria-hidden="true" />
                            <button
                              type="button"
                              aria-expanded={monthOpen}
                              onClick={() => toggleMonth(group.key)}
                              className="w-full rounded-md border border-ink-200 bg-ink-50/80 px-4 py-3 text-left transition hover:border-signal-300 hover:bg-white dark:border-ink-800 dark:bg-ink-900/55 dark:hover:border-signal-700 dark:hover:bg-ink-950 sm:px-5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                  <h3 className="text-base font-semibold text-ink-950 dark:text-white">{Number(group.month)} 月</h3>
                                  <p className="text-sm text-ink-500 dark:text-ink-400">{group.posts.length} 篇</p>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition", monthOpen ? "rotate-0" : "-rotate-90")} />
                              </div>
                            </button>
                          </div>

                          {monthOpen ? (
                            <div className="space-y-3">
                              {group.posts.map((post) => (
                                <article key={post.slug} className="group relative pl-12 sm:pl-16">
                                  <span className="absolute left-3 top-5 h-2 w-2 rounded-full border border-ink-300 bg-white transition group-hover:border-signal-400 dark:border-ink-700 dark:bg-ink-950" aria-hidden="true" />
                                  <div className="rounded-md border border-ink-200 bg-white p-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-signal-300 group-hover:bg-ink-50/80 group-hover:shadow-soft sm:p-5 dark:border-ink-800 dark:bg-ink-950 dark:group-hover:border-signal-700 dark:group-hover:bg-ink-900/60 dark:group-hover:shadow-soft-dark">
                                    <div className="grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start">
                                      <time className="text-sm tabular-nums text-ink-500 dark:text-ink-400" dateTime={post.date}>
                                        {formatDate(post.date)}
                                      </time>
                                      <div className="min-w-0">
                                        <Link href={post.url} className="text-base font-semibold leading-7 text-ink-950 transition hover:text-signal-700 dark:text-white dark:hover:text-signal-300">
                                          {post.title}
                                        </Link>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                          <Link
                                            href={`/categories/${encodeURIComponent(post.category)}`}
                                            className="rounded-md border border-signal-200 bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-700 transition hover:border-signal-300 hover:text-signal-900 dark:border-signal-900/70 dark:bg-signal-950/40 dark:text-signal-300 dark:hover:border-signal-700 dark:hover:text-signal-100"
                                          >
                                            {post.category}
                                          </Link>
                                          {post.tags.map((tag) => (
                                            <Tag key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                                              {tag}
                                            </Tag>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
