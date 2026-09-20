import { SectionTitle } from "@/components/classic/SectionTitle";
import { TagIndex } from "@/components/classic/TagIndex";
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
        as="h1"
        eyebrow="Tags"
        title="标签索引"
        description="标签用于连接跨主题的文章线索，例如 AI RAN、数字孪生、系统仿真、技术管理。"
      />
      <TagIndex tags={tags} />
    </div>
  );
}
