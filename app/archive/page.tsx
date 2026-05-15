import { ArchiveTimeline } from "@/components/ArchiveTimeline";
import { SectionTitle } from "@/components/SectionTitle";
import { getArchiveGroups } from "@/lib/posts";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "写作轨迹",
  description: "按年份、分类、标签和系列浏览向福星个人博客写作轨迹。",
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
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        eyebrow="Archive"
        title="写作轨迹"
        description="从年度总结、主题系列和时间线三个角度回看文章脉络，观察技术学习、管理复盘和个人成长的长期演进。"
      />
      <ArchiveTimeline yearGroups={yearGroups} />
    </div>
  );
}
