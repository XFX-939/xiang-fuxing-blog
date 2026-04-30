"use client";

import Link from "next/link";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { TagList } from "@/components/TagList";
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
    <div className="mt-8 sm:mt-10">
      <div className="mb-6 flex flex-col gap-3 rounded-[18px] border border-border bg-surface p-4 sm:rounded-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">时间轴视图</p>
          <p className="mt-1 text-sm leading-6 text-muted">支持按年份、月份折叠，适合快速扫读文章脉络。</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:border-accent hover:text-accent"
          >
            <ChevronsUpDown className="h-4 w-4" />
            全部展开
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:border-accent hover:text-accent"
          >
            <ChevronsDownUp className="h-4 w-4" />
            全部折叠
          </button>
        </div>
      </div>

      <div className="relative min-w-0">
        <div className="absolute bottom-2 left-4 top-2 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:left-5" aria-hidden="true" />

        <div className="min-w-0 space-y-10 sm:space-y-12">
          {yearGroups.map((yearGroup) => {
            const yearOpen = openYears.has(yearGroup.year);

            return (
              <section key={yearGroup.year} className="space-y-6">
                <div className="relative pl-10 sm:pl-16">
                  <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-accent bg-surface shadow-sm ring-4 ring-accent-soft dark:border-accent" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent dark:bg-accent" />
                  </span>
                  <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <button
                      type="button"
                      aria-expanded={yearOpen}
                      onClick={() => toggleYear(yearGroup.year)}
                      className="group inline-flex w-fit items-center gap-3 text-left"
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-accent">Year</span>
                        <span className="mt-1 block text-3xl font-semibold tracking-normal text-primary transition group-hover:text-accent dark:group-hover:text-accent">
                          {yearGroup.year}
                        </span>
                      </span>
                      <ChevronDown className={cn("mt-6 h-5 w-5 text-muted transition group-hover:text-accent dark:group-hover:text-accent", yearOpen ? "rotate-0" : "-rotate-90")} />
                    </button>
                    <p className="text-sm text-muted">
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
                          <div className="relative pl-10 sm:pl-16">
                            <span className="absolute left-2 top-5 h-4 w-4 rounded-full border border-accent bg-accent-soft dark:border-border dark:bg-accent-soft" aria-hidden="true" />
                            <button
                              type="button"
                              aria-expanded={monthOpen}
                              onClick={() => toggleMonth(group.key)}
                              className="w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-left transition hover:border-accent hover:bg-surface sm:px-5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                  <h3 className="text-base font-semibold text-primary">{Number(group.month)} 月</h3>
                                  <p className="text-sm text-muted">{group.posts.length} 篇</p>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition", monthOpen ? "rotate-0" : "-rotate-90")} />
                              </div>
                            </button>
                          </div>

                          {monthOpen ? (
                            <div className="space-y-3">
                              {group.posts.map((post) => (
                                <article key={post.slug} className="group relative pl-10 sm:pl-16">
                                  <span className="absolute left-3 top-5 h-2 w-2 rounded-full border border-border bg-surface transition group-hover:border-accent" aria-hidden="true" />
                                  <div className="rounded-[18px] border border-border bg-surface p-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:bg-surface-elevated group-hover:shadow-soft sm:rounded-md sm:p-5 dark:group-hover:shadow-soft-dark">
                                    <div className="grid gap-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start sm:gap-3">
                                      <time className="text-sm tabular-nums text-muted" dateTime={post.date}>
                                        {formatDate(post.date)}
                                      </time>
                                      <div className="min-w-0">
                                        <Link href={post.url} className="text-base font-semibold leading-7 text-primary transition hover:text-accent dark:hover:text-accent">
                                          {post.title}
                                        </Link>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                                          <Link
                                            href={`/categories/${encodeURIComponent(post.category)}`}
                                            className="rounded-md border border-border bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent transition hover:border-accent hover:text-accent"
                                          >
                                            {post.category}
                                          </Link>
                                          <TagList
                                            className="hidden sm:flex"
                                            tags={post.tags}
                                            maxVisible={2}
                                            compact
                                            getHref={(tag) => `/tags/${encodeURIComponent(tag)}`}
                                          />
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
