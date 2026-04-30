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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Tags"
        title="标签索引"
        description="标签用于连接跨主题的文章线索，例如 AI RAN、数字孪生、系统仿真、技术管理。"
      />
      <div className="flex flex-wrap gap-3 rounded-md border border-border bg-surface p-6">
        {tags.map((tag) => (
          <Tag key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} count={tag.count}>
            {tag.name}
          </Tag>
        ))}
      </div>
    </div>
  );
}
