import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { TagList } from "@/components/TagList";

type ArticleCardProps = {
  post: Post;
  compact?: boolean;
};

export function ArticleCard({ post, compact = false }: ArticleCardProps) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-ink-200 bg-white p-5 transition hover:border-signal-300 hover:shadow-soft sm:rounded-md sm:p-6 dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700 dark:hover:shadow-soft-dark">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
        <Link href={`/categories/${encodeURIComponent(post.category)}`} className="font-medium text-signal-700 dark:text-signal-300">
          {post.category}
        </Link>
        <span>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>·</span>
        <span>{post.readingTime}</span>
      </div>
      <Link href={post.url} className="flex min-w-0 items-start justify-between gap-4">
        <h3 className="min-w-0 text-lg font-semibold leading-7 text-ink-950 transition group-hover:text-signal-800 sm:leading-8 dark:text-white dark:group-hover:text-signal-300">
          {post.title}
        </h3>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition group-hover:text-signal-600" />
      </Link>
      <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-ink-600 sm:text-sm dark:text-ink-300">
        {post.description}
      </p>
      <TagList
        className="mt-4"
        tags={post.tags}
        maxVisible={compact ? 2 : 3}
        compact={compact}
        getHref={(tag) => `/tags/${encodeURIComponent(tag)}`}
      />
    </article>
  );
}
