import { ArchiveTimeline } from "@/components/ArchiveTimeline";
import { SectionTitle } from "@/components/SectionTitle";
import { getArchiveGroups } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "归档",
  description: "按年份和月份浏览所有博客文章。",
  path: "/archive"
});

export default function ArchivePage() {
  const groups = getArchiveGroups();
  type MonthGroup = (typeof groups)[number];
  const yearGroups = groups.reduce<Array<{ year: string; count: number; months: MonthGroup[] }>>((acc, group) => {
    const existing = acc.find((item) => item.year === group.year);

    if (existing) {
      existing.months.push(group);
      existing.count += group.posts.length;
      return acc;
    }

    acc.push({
      year: group.year,
      count: group.posts.length,
      months: [group]
    });

    return acc;
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Archive"
        title="文章归档"
        description="按时间线快速回看文章脉络。"
      />
      <ArchiveTimeline yearGroups={yearGroups} />
    </div>
  );
}
