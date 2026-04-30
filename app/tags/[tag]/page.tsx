import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

type TagPageProps = {
  params: {
    tag: string;
  };
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag: tag.name
  }));
}

export function generateMetadata({ params }: TagPageProps): Metadata {
  const tag = decodeURIComponent(params.tag);
  return createMetadata({
    title: `标签：${tag}`,
    description: `浏览标签「${tag}」下的文章。`,
    path: `/tags/${encodeURIComponent(tag)}`
  });
}

export default function TagDetailPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Tag"
        title={`标签：${tag}`}
        description={`共 ${posts.length} 篇文章。`}
        action={
          <Link href="/tags" className="text-sm font-semibold text-accent hover:text-primary">
            返回标签索引
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
