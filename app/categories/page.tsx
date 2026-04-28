import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import { createMetadata, formatDate } from "@/lib/utils";

export const metadata = createMetadata({
  title: "分类",
  description: "按文章分类浏览无线通信、系统仿真、AI辅助研发、技术管理等主题。",
  path: "/categories"
});

export default function CategoriesPage() {
  const categories = getAllCategories();
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Categories"
        title="分类索引"
        description="分类用于组织文章主线，适合按知识领域系统浏览；标签则用于连接跨领域的问题线索。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => {
          const latestPost = posts.find((post) => post.category === category.name);

          return (
            <Link
              key={category.name}
              href={`/categories/${encodeURIComponent(category.name)}`}
              className="group rounded-md border border-ink-200 bg-white p-5 transition hover:border-signal-300 hover:shadow-soft dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700 dark:hover:shadow-soft-dark"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-signal-50 text-signal-700 dark:bg-signal-950 dark:text-signal-300">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-4 w-4 text-ink-400 transition group-hover:text-signal-600" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-ink-950 transition group-hover:text-signal-800 dark:text-white dark:group-hover:text-signal-300">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                {category.count} 篇文章
              </p>
              {latestPost ? (
                <div className="mt-4 rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-900/60">
                  <p className="text-xs text-ink-500 dark:text-ink-400">最新文章 · {formatDate(latestPost.date)}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-ink-800 dark:text-ink-100">
                    {latestPost.title}
                  </p>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
