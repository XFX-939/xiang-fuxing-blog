import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navItems } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { topicHubs } from "@/lib/topics";

export function Header() {
  const posts = getAllPosts().map(({ title, description, category, tags, url, searchText, date }) => ({
    title,
    description,
    category,
    tags,
    url,
    searchText,
    date
  }));

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b border-ink-200/70 bg-white/90 backdrop-blur-xl dark:border-ink-800/80 dark:bg-ink-950/88">
      <div className="border-b border-ink-200/70 bg-ink-950 text-white dark:border-ink-800 dark:bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 text-xs sm:px-6">
          <p className="truncate font-semibold tracking-normal text-signal-100">
            用 AI 重构复杂工程问题的建模、仿真与决策
          </p>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {topicHubs.map((topic) => (
              <Link
                key={topic.slug}
                href={topic.href}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-300 transition hover:bg-white/10 hover:text-white"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-950">
          <Logo text="向福星" gradientId="logo-signal-header" textClassName="hidden sm:inline" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <GlobalSearch posts={posts} className="hidden w-[30rem] max-w-[38vw] 2xl:w-[34rem] xl:block" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-3 sm:px-6 xl:hidden">
        <GlobalSearch posts={posts} />
      </div>
    </header>
  );
}
