import { BlogExplorer } from "@/components/BlogExplorer";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllCategories, getAllPostListItems, getAllTags } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "博客",
  description: "无线通信、系统仿真、AI辅助研发、技术管理和个人成长文章列表。",
  path: "/blog"
});

type BlogPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getAllPostListItems();
  const categories = getAllCategories();
  const tags = getAllTags();
  const initialCategory = searchParams?.category ? decodeURIComponent(searchParams.category) : "全部";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        eyebrow="Blog"
        title="文章体系"
        description="按分类、标签和关键词检索文章。搜索会覆盖标题、摘要、正文和标签，默认按发布时间倒序。"
      />
      <BlogExplorer posts={posts} categories={categories} tags={tags} initialCategory={initialCategory} />
    </div>
  );
}
