import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostListItem } from "@/lib/posts";
import { cn, formatDate } from "@/lib/utils";

type ArticleCardProps = {
  post: PostListItem;
  compact?: boolean;
  index?: number;
};

export function ArticleCard({ post, compact = false, index }: ArticleCardProps) {
  const visibleTags = post.tags.slice(0, compact ? 2 : 3);
  const hiddenTagCount = Math.max(post.tags.length - visibleTags.length, 0);

  return (
    <article
      data-article-row
      className="group min-w-0 border-b border-border px-1 py-6 transition-colors duration-300 hover:bg-accent-soft/40 sm:px-3 sm:py-7"
    >
      <div
        className={cn(
          "grid min-w-0 gap-x-4 sm:gap-x-6",
          typeof index === "number"
            ? "grid-cols-[2.25rem_minmax(0,1fr)] sm:grid-cols-[3rem_minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto]"
        )}
      >
        {typeof index === "number" ? (
          <span
            data-reveal
            className="pt-0.5 font-mono text-xs font-semibold tabular-nums tracking-[0.14em] text-accent sm:text-sm"
            aria-hidden="true"
          >
            {String(index).padStart(2, "0")}
          </span>
        ) : null}

        <div className="min-w-0">
          <div data-reveal className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium tracking-[0.04em] text-muted sm:text-xs">
            <Link
              href={`/categories/${encodeURIComponent(post.category)}`}
              className="font-semibold text-accent transition hover:opacity-70"
            >
              {post.category}
            </Link>
            <span aria-hidden="true" className="text-border">━</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true" className="text-border">━</span>
            <span>{post.readingTime}</span>
          </div>

          <Link href={post.url} className="block min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-bg">
            <h3
              data-reveal
              className={cn(
                "min-w-0 font-semibold leading-[1.35] tracking-[-0.025em] text-primary transition-colors duration-300 group-hover:text-accent",
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              )}
            >
              {post.title}
            </h3>
            <p
              data-reveal
              className={cn(
                "mt-3 text-sm leading-7 text-secondary sm:text-[15px]",
                compact ? "line-clamp-1" : "line-clamp-2"
              )}
            >
              {post.description}
            </p>
          </Link>

          {visibleTags.length > 0 ? (
            <div data-reveal className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              {visibleTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="border-b border-transparent pb-0.5 transition hover:border-accent hover:text-accent"
                >
                  #{tag}
                </Link>
              ))}
              {hiddenTagCount > 0 ? <span>+{hiddenTagCount}</span> : null}
            </div>
          ) : null}
        </div>

        <Link
          href={post.url}
          aria-label={`阅读：${post.title}`}
          data-reveal
          className={cn(
            "hidden h-10 w-10 items-center justify-center self-center border border-border text-muted transition duration-300 hover:border-accent hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline-flex",
            typeof index === "number" && "sm:col-start-3"
          )}
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
