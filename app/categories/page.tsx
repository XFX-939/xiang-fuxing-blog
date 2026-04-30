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
              className="group rounded-md border border-border bg-surface p-5 transition hover:border-accent hover:shadow-soft dark:hover:shadow-soft-dark"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-4 w-4 text-muted transition group-hover:text-accent" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-primary transition group-hover:text-accent">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {category.count} 篇文章
              </p>
              {latestPost ? (
                <div className="mt-4 rounded-md border border-border bg-surface-elevated p-4">
                  <p className="text-xs text-muted">最新文章 · {formatDate(latestPost.date)}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-primary">
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
