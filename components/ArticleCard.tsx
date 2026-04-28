import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/Tag";

type ArticleCardProps = {
  post: Post;
  compact?: boolean;
};

export function ArticleCard({ post, compact = false }: ArticleCardProps) {
  return (
    <article className="group rounded-md border border-ink-200 bg-white p-5 transition hover:border-signal-300 hover:shadow-soft sm:p-6 dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700 dark:hover:shadow-soft-dark">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
        <Link href={`/categories/${encodeURIComponent(post.category)}`} className="font-medium text-signal-700 dark:text-signal-300">
          {post.category}
        </Link>
        <span>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>·</span>
        <span>{post.readingTime}</span>
      </div>
      <Link href={post.url} className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-8 text-ink-950 transition group-hover:text-signal-800 dark:text-white dark:group-hover:text-signal-300">
          {post.title}
        </h3>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition group-hover:text-signal-600" />
      </Link>
      <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
        {post.description}
      </p>
      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
              {tag}
            </Tag>
          ))}
        </div>
      ) : null}
    </article>
  );
}
