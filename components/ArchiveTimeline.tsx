"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarRange,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Filter,
  Layers3,
  RefreshCcw,
  Search
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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

type ArchivePostWithSeries = ArchivePost & {
  series: string;
};

type ArchiveMonth = {
  key: string;
  year: string;
  month: string;
  label: string;
  posts: ArchivePost[];
};

type ArchiveMonthWithSeries = Omit<ArchiveMonth, "posts"> & {
  posts: ArchivePostWithSeries[];
};

export type ArchiveYearGroup = {
  year: string;
  count: number;
  months: ArchiveMonth[];
};

type ArchiveYearGroupWithSeries = Omit<ArchiveYearGroup, "months"> & {
  months: ArchiveMonthWithSeries[];
};

type ArchiveTimelineProps = {
  yearGroups: ArchiveYearGroup[];
};

const ALL = "全部";

const annualSummaries: Record<string, { title: string; summary: string; keywords: string[] }> = {
  "2026": {
    title: "体系化输出启动年",
    summary: "从系统仿真、AI For Science、AI Coding 到技术管理，开始把技术认知、职业转型和组织观察放进同一套长期知识系统。",
    keywords: ["系统仿真", "AI辅助研发", "技术管理", "职业转型"]
  },
  "2025": {
    title: "前场视角与管理认知补课",
    summary: "围绕解决方案岗位、协同调度、心胜模型和时间优先级，把个人成长从执行能力扩展到客户、组织和选择判断。",
    keywords: ["职业转型", "协同调度", "心胜", "优先级"]
  },
  "2024": {
    title: "无线算法与工程基础沉淀",
    summary: "集中整理调度、功率控制、移动性、AMC、载波资源和矩阵分解等基础能力，形成偏工程学习卡片的知识底座。",
    keywords: ["无线通信", "算法学习", "工程基础", "学习卡片"]
  }
};

function getArchiveSeries(post: ArchivePost) {
  const title = post.title;
  const tags = new Set(post.tags);

  if (title.includes("学习卡片")) {
    return post.category === "无线通信" ? "无线通信学习卡片" : "工程基础学习卡片";
  }

  if (post.category === "系统仿真" || tags.has("系统仿真") || tags.has("数字孪生") || tags.has("AI For Science")) {
    return "系统仿真与 AI for Science";
  }

  if (post.category === "AI辅助研发" || tags.has("AI Coding") || tags.has("AI辅助研发") || tags.has("Obsidian") || tags.has("CodeAgent")) {
    return "AI 辅助研发与工具流";
  }

  if (post.category === "技术管理" || tags.has("技术管理") || tags.has("团队管理") || tags.has("组织能力")) {
    return "技术管理与组织能力";
  }

  if (post.category === "个人成长" || tags.has("个人成长") || tags.has("职业转型") || tags.has("海外行销")) {
    return "个人成长与职业转型";
  }

  if (post.category === "读书笔记" || tags.has("读书笔记")) {
    return "读书与方法复盘";
  }

  return "工具效率与编程学习";
}

function countValues(values: string[]) {
  const map = new Map<string, number>();

  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

function groupPosts(posts: ArchivePostWithSeries[]): ArchiveYearGroupWithSeries[] {
  const yearMap = new Map<string, Map<string, ArchiveMonthWithSeries>>();

  for (const post of posts) {
    const date = new Date(post.date);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }

    const monthMap = yearMap.get(year)!;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        key,
        year,
        month,
        label: `${year} 年 ${Number(month)} 月`,
        posts: []
      });
    }

    monthMap.get(key)!.posts.push(post);
  }

  return Array.from(yearMap.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, monthMap]) => {
      const months = Array.from(monthMap.values())
        .sort((a, b) => Number(b.month) - Number(a.month))
        .map((month) => ({
          ...month,
          posts: [...month.posts].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
        }));

      return {
        year,
        count: months.reduce((sum, month) => sum + month.posts.length, 0),
        months
      };
    });
}

function filterButtonClass(active: boolean) {
  return cn(
    "inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-border bg-surface-elevated text-secondary hover:border-accent hover:text-accent"
  );
}

export function ArchiveTimeline({ yearGroups }: ArchiveTimelineProps) {
  const allPosts = useMemo(
    () =>
      yearGroups
        .flatMap((group) => group.months.flatMap((month) => month.posts))
        .map((post) => ({
          ...post,
          series: getArchiveSeries(post)
        }))
        .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))),
    [yearGroups]
  );

  const years = useMemo(() => Array.from(new Set(allPosts.map((post) => String(new Date(post.date).getFullYear())))), [allPosts]);
  const categories = useMemo(() => countValues(allPosts.map((post) => post.category)), [allPosts]);
  const tags = useMemo(() => countValues(allPosts.flatMap((post) => post.tags)), [allPosts]);
  const seriesOptions = useMemo(() => countValues(allPosts.map((post) => post.series)), [allPosts]);

  const [year, setYear] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [tag, setTag] = useState(ALL);
  const [series, setSeries] = useState(ALL);
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allPosts.filter((post) => {
      const postYear = String(new Date(post.date).getFullYear());
      const matchYear = year === ALL || postYear === year;
      const matchCategory = category === ALL || post.category === category;
      const matchTag = tag === ALL || post.tags.includes(tag);
      const matchSeries = series === ALL || post.series === series;
      const matchQuery =
        !normalizedQuery ||
        [post.title, post.category, post.series, ...post.tags].join(" ").toLowerCase().includes(normalizedQuery);

      return matchYear && matchCategory && matchTag && matchSeries && matchQuery;
    });
  }, [allPosts, category, query, series, tag, year]);

  const filteredYearGroups = useMemo(() => groupPosts(filteredPosts), [filteredPosts]);
  const filteredYearKeys = useMemo(() => filteredYearGroups.map((group) => group.year), [filteredYearGroups]);
  const filteredMonthKeys = useMemo(() => filteredYearGroups.flatMap((group) => group.months.map((month) => month.key)), [filteredYearGroups]);

  const [openYears, setOpenYears] = useState<Set<string>>(() => new Set(years));
  const [openMonths, setOpenMonths] = useState<Set<string>>(
    () => new Set(yearGroups.flatMap((group) => group.months.map((month) => month.key)))
  );

  useEffect(() => {
    setOpenYears(new Set(filteredYearKeys));
    setOpenMonths(new Set(filteredMonthKeys));
  }, [filteredMonthKeys, filteredYearKeys]);

  const allExpanded = openYears.size === filteredYearKeys.length && openMonths.size === filteredMonthKeys.length;

  function toggleYear(targetYear: string) {
    setOpenYears((current) => {
      const next = new Set(current);
      if (next.has(targetYear)) {
        next.delete(targetYear);
      } else {
        next.add(targetYear);
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
    setOpenYears(new Set(filteredYearKeys));
    setOpenMonths(new Set(filteredMonthKeys));
  }

  function collapseAll() {
    setOpenYears(new Set());
    setOpenMonths(new Set());
  }

  function resetFilters() {
    setYear(ALL);
    setCategory(ALL);
    setTag(ALL);
    setSeries(ALL);
    setQuery("");
  }

  return (
    <div className="mt-8 sm:mt-10">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard icon={<BookOpen className="h-4 w-4" />} label="文章总量" value={`${allPosts.length} 篇`} />
        <MetricCard icon={<CalendarRange className="h-4 w-4" />} label="写作年份" value={`${years.length} 年`} />
        <MetricCard icon={<Filter className="h-4 w-4" />} label="内容分类" value={`${categories.length} 类`} />
        <MetricCard icon={<Layers3 className="h-4 w-4" />} label="写作系列" value={`${seriesOptions.length} 组`} />
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Writing Trajectory</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">年度写作总结</h2>
          </div>
          <p className="hidden text-sm text-muted sm:block">从年份看主题重心的迁移。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {["2026", "2025", "2024"].map((summaryYear) => {
            const posts = allPosts.filter((post) => String(new Date(post.date).getFullYear()) === summaryYear);
            const summary = annualSummaries[summaryYear];
            const topCategories = countValues(posts.map((post) => post.category)).slice(0, 2);
            const topTags = countValues(posts.flatMap((post) => post.tags)).slice(0, 3);

            return (
              <article key={summaryYear} className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Year</p>
                    <h3 className="mt-2 text-3xl font-semibold text-primary">{summaryYear}</h3>
                  </div>
                  <span className="rounded-md border border-border bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                    {posts.length} 篇
                  </span>
                </div>
                <h4 className="mt-4 text-base font-semibold text-primary">{summary.title}</h4>
                <p className="mt-3 text-sm leading-7 text-secondary">{summary.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...summary.keywords, ...topCategories.map((item) => item.name), ...topTags.map((item) => item.name)]
                    .filter((item, index, array) => array.indexOf(item) === index)
                    .slice(0, 6)
                    .map((keyword) => (
                      <span key={keyword} className="rounded-md border border-border bg-tag-bg px-2 py-1 text-xs text-tag-text">
                        {keyword}
                      </span>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-[18px] border border-border bg-surface p-4 sm:rounded-md sm:p-5" aria-label="归档筛选">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">筛选写作轨迹</p>
            <p className="mt-1 text-sm leading-6 text-muted">支持按年份、分类、标签、系列和关键词组合筛选。</p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:border-accent hover:text-accent sm:w-auto"
          >
            <RefreshCcw className="h-4 w-4" />
            重置筛选
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <FilterGroup label="年份">
            <button type="button" onClick={() => setYear(ALL)} className={filterButtonClass(year === ALL)}>
              全部
            </button>
            {years.map((item) => (
              <button key={item} type="button" onClick={() => setYear(item)} className={filterButtonClass(year === item)}>
                {item}
              </button>
            ))}
          </FilterGroup>

          <FilterGroup label="分类">
            <button type="button" onClick={() => setCategory(ALL)} className={filterButtonClass(category === ALL)}>
              全部
            </button>
            {categories.map((item) => (
              <button key={item.name} type="button" onClick={() => setCategory(item.name)} className={filterButtonClass(category === item.name)}>
                {item.name}
                <span className="ml-1 text-xs text-muted">{item.count}</span>
              </button>
            ))}
          </FilterGroup>

          <FilterGroup label="系列">
            <button type="button" onClick={() => setSeries(ALL)} className={filterButtonClass(series === ALL)}>
              全部
            </button>
            {seriesOptions.map((item) => (
              <button key={item.name} type="button" onClick={() => setSeries(item.name)} className={filterButtonClass(series === item.name)}>
                {item.name}
              </button>
            ))}
          </FilterGroup>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-primary">标签</span>
              <select
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                className="h-11 rounded-md border border-border bg-surface-elevated px-3 text-sm text-secondary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft"
              >
                <option value={ALL}>全部标签</option>
                {tags.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}（{item.count}）
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-primary">关键词</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索标题、分类、标签或系列"
                  className="h-11 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-3 text-sm text-secondary outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft"
                />
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-6 flex flex-col gap-3 rounded-[18px] border border-border bg-surface p-4 sm:rounded-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">写作轨迹视图</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              当前匹配 {filteredPosts.length} / {allPosts.length} 篇文章，仍按年份、月份保留折叠时间线。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:border-accent hover:text-accent"
            >
              {allExpanded ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
              {allExpanded ? "全部折叠" : "全部展开"}
            </button>
            <button
              type="button"
              onClick={expandAll}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:border-accent hover:text-accent"
            >
              <ChevronsUpDown className="h-4 w-4" />
              展开结果
            </button>
          </div>
        </div>

        {filteredYearGroups.length > 0 ? (
          <div className="relative min-w-0">
            <div className="absolute bottom-2 left-4 top-2 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:left-5" aria-hidden="true" />

            <div className="min-w-0 space-y-10 sm:space-y-12">
              {filteredYearGroups.map((yearGroup) => {
                const yearOpen = openYears.has(yearGroup.year);

                return (
                  <section key={yearGroup.year} className="space-y-6">
                    <div className="relative pl-10 sm:pl-16">
                      <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-accent bg-surface shadow-sm ring-4 ring-accent-soft" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
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
                            <span className="mt-1 block text-3xl font-semibold tracking-normal text-primary transition group-hover:text-accent">
                              {yearGroup.year}
                            </span>
                          </span>
                          <ChevronDown className={cn("mt-6 h-5 w-5 text-muted transition group-hover:text-accent", yearOpen ? "rotate-0" : "-rotate-90")} />
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
                                <span className="absolute left-2 top-5 h-4 w-4 rounded-full border border-accent bg-accent-soft" aria-hidden="true" />
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
                                            <Link href={post.url} className="text-base font-semibold leading-7 text-primary transition hover:text-accent">
                                              {post.title}
                                            </Link>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                                              <Link
                                                href={`/categories/${encodeURIComponent(post.category)}`}
                                                className="rounded-md border border-border bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent transition hover:border-accent"
                                              >
                                                {post.category}
                                              </Link>
                                              <span className="rounded-md border border-border bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-text">
                                                {post.series}
                                              </span>
                                              <TagList
                                                className="hidden sm:flex"
                                                tags={post.tags}
                                                maxVisible={2}
                                                compact
                                                getHref={(tagName) => `/tags/${encodeURIComponent(tagName)}`}
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
        ) : (
          <div className="rounded-[18px] border border-border bg-surface p-8 text-center sm:rounded-md">
            <p className="text-lg font-semibold text-primary">没有匹配的文章</p>
            <p className="mt-2 text-sm text-muted">可以减少筛选条件，或者重置后重新查看完整写作轨迹。</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
            >
              重置筛选
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-surface p-4 sm:rounded-md">
      <div className="flex items-center gap-2 text-accent">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-primary">{label}</p>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {children}
      </div>
    </div>
  );
}
