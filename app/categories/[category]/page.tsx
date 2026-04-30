import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export function generateStaticParams() {
  return getAllCategories().map((category) => ({
    category: category.name
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = decodeURIComponent(params.category);

  return createMetadata({
    title: `分类：${category}`,
    description: `浏览分类「${category}」下的文章。`,
    path: `/categories/${encodeURIComponent(category)}`
  });
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Category"
        title={`分类：${category}`}
        description={`共 ${posts.length} 篇文章，默认按发布时间倒序排列。`}
        action={
          <Link href="/categories" className="text-sm font-semibold text-accent hover:text-primary">
            返回分类索引
          </Link>
        }
      />
      <div className="grid gap-4">
        {posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
