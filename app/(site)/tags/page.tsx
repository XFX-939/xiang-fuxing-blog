import { SectionTitle } from "@/components/SectionTitle";
import { Tag } from "@/components/Tag";
import { getAllTags } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "标签",
  description: "按标签浏览文章主题。",
  path: "/tags"
});

export default function TagsPage() {
  const tags = getAllTags();
  const recurringTags = tags.filter((tag) => tag.count > 1);
  const oneOffTags = tags.filter((tag) => tag.count === 1);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-20">
      <SectionTitle
        as="h1"
        variant="editorial"
        eyebrow="Cross-topic signals"
        title="标签索引"
        description="标签用于连接跨主题的文章线索，例如 AI RAN、数字孪生、系统仿真、技术管理。"
      />
      <section className="border-y border-border py-7" aria-labelledby="recurring-tags-heading">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <h2 id="recurring-tags-heading" className="text-2xl font-semibold tracking-[-0.025em] text-primary">持续主题</h2>
            <p className="mt-2 text-[15px] leading-7 text-secondary">在多篇文章中反复出现的 {recurringTags.length} 条主线。</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {recurringTags.map((tag) => (
            <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count} size="index">
              {tag.name}
            </Tag>
          ))}
        </div>
      </section>

      <details className="group border-b border-border">
        <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <div>
            <h2 className="text-xl font-semibold text-primary">细分线索</h2>
            <p className="mt-1 text-sm text-secondary">仅出现一次的 {oneOffTags.length} 个标签，默认收起以减少噪声。</p>
          </div>
          <span className="text-sm font-semibold text-accent group-open:hidden">展开 ↓</span>
          <span className="hidden text-sm font-semibold text-accent group-open:inline">收起 ↑</span>
        </summary>
        <div className="flex flex-wrap gap-x-3 gap-y-2 pb-8">
          {oneOffTags.map((tag) => (
            <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count} size="index">
            {tag.name}
          </Tag>
          ))}
        </div>
      </details>
    </div>
  );
}
