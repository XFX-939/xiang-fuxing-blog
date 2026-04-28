import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { getArchiveGroups } from "@/lib/posts";
import { createMetadata, formatDate } from "@/lib/utils";

export const metadata = createMetadata({
  title: "归档",
  description: "按年份和月份浏览所有博客文章。",
  path: "/archive"
});

export default function ArchivePage() {
  const groups = getArchiveGroups();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Archive"
        title="文章归档"
        description="按时间线快速回看文章脉络。"
      />
      <div className="grid gap-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-4 text-lg font-semibold text-ink-950 dark:text-white">{group.label}</h2>
            <div className="rounded-md border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
              {group.posts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={post.url}
                  className="grid gap-2 border-ink-200 px-5 py-4 transition hover:bg-ink-50 sm:grid-cols-[120px_1fr_auto] sm:items-center dark:border-ink-800 dark:hover:bg-ink-900/60"
                  style={{ borderTopWidth: index === 0 ? 0 : 1 }}
                >
                  <time className="text-sm text-ink-500 dark:text-ink-400" dateTime={post.date}>{formatDate(post.date)}</time>
                  <span className="font-medium text-ink-900 dark:text-white">{post.title}</span>
                  <span className="text-sm text-signal-700 dark:text-signal-300">{post.category}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
