import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

type RecommendedArticlesProps = {
  posts: Post[];
  title?: string;
  description?: string;
};

export function RecommendedArticles({
  posts,
  title = "推荐继续阅读",
  description = "优先推荐标签或分类相关的文章；没有足够相关内容时，补充最新文章。"
}: RecommendedArticlesProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recommended-articles-title">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-700 dark:text-signal-300">Next Reading</p>
        <h2 id="recommended-articles-title" className="mt-2 text-xl font-semibold tracking-normal text-ink-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-ink-600 dark:text-ink-300">{description}</p>
      </div>

      <div className="mt-5 grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={post.url}
            className="group rounded-md border border-ink-200 bg-white p-4 transition hover:border-signal-300 hover:shadow-soft dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700 dark:hover:shadow-soft-dark"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <span className="font-medium text-signal-700 dark:text-signal-300">{post.category}</span>
                  <span>·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-6 text-ink-950 transition group-hover:text-signal-800 dark:text-white dark:group-hover:text-signal-300">
                  {post.title}
                </h3>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition group-hover:text-signal-600 dark:group-hover:text-signal-300" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
