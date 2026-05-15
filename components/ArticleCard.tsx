import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostListItem } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { TagList } from "@/components/TagList";

type ArticleCardProps = {
  post: PostListItem;
  compact?: boolean;
};

export function ArticleCard({ post, compact = false }: ArticleCardProps) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-border bg-surface p-5 transition hover:border-accent hover:shadow-soft sm:rounded-md sm:p-6 dark:hover:shadow-soft-dark">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href={`/categories/${encodeURIComponent(post.category)}`} className="font-medium text-accent">
          {post.category}
        </Link>
        <span>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>·</span>
        <span>{post.readingTime}</span>
      </div>
      <Link href={post.url} className="flex min-w-0 items-start justify-between gap-4">
        <h3 className="min-w-0 text-lg font-semibold leading-7 text-primary transition group-hover:text-accent sm:leading-8">
          {post.title}
        </h3>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:text-accent" />
      </Link>
      <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-secondary sm:text-sm">
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
