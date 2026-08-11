import { BlogExplorer } from "@/components/BlogExplorer";
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
    <div className="w-full max-w-full overflow-x-hidden">
      <section className="border-b border-border" aria-labelledby="field-notes-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.7fr)] lg:items-end lg:py-24">
          <div className="max-w-6xl">
            <p className="mb-5 text-xs font-semibold tracking-[0.18em] text-accent">
              无线通信 · AI 研发 · 系统实践
            </p>
            <h1
              id="field-notes-title"
              className="max-w-6xl text-[clamp(3rem,7vw,6.75rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-primary"
            >
              信号场
              <span
                aria-hidden="true"
                className="relative mx-[0.12em] inline-flex h-[0.64em] w-[1.12em] translate-y-[0.02em] items-center overflow-hidden border-y border-accent align-baseline"
              >
                <span className="h-px w-full bg-accent" />
                <span className="absolute left-[18%] h-[38%] w-px bg-accent" />
                <span className="absolute left-[49%] h-[78%] w-px bg-accent" />
                <span className="absolute right-[18%] h-[52%] w-px bg-accent" />
              </span>
              笔记
            </h1>
          </div>

          <div className="border-l-2 border-accent pl-5 sm:pl-6">
            <p className="text-base leading-8 text-secondary">
              从系统仿真到技术管理，把复杂问题拆成可复现、可验证、可继续推进的现场记录。
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              支持全文检索，也可按分类与标签缩小信号范围。
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <BlogExplorer posts={posts} categories={categories} tags={tags} initialCategory={initialCategory} />
      </div>
    </div>
  );
}
