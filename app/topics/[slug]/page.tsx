import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getPostsByCategory } from "@/lib/posts";
import { getTopicBySlug, topicHubs } from "@/lib/topics";
import { createMetadata } from "@/lib/utils";

type TopicPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return topicHubs.map((topic) => ({ slug: topic.slug }));
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const topic = getTopicBySlug(params.slug);

  if (!topic) {
    return createMetadata({
      title: "主题不存在",
      description: "主题不存在或已被移除。"
    });
  }

  return createMetadata({
    title: `${topic.title}专题`,
    description: topic.description,
    path: topic.href,
    tags: [...topic.keywords]
  });
}

export default function TopicPage({ params }: TopicPageProps) {
  const topic = getTopicBySlug(params.slug);

  if (!topic) {
    notFound();
  }

  const posts = getPostsByCategory(topic.category);
  const relatedTopics = topicHubs.filter((item) => item.slug !== topic.slug);
  const Icon = topic.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition hover:text-signal-700 dark:text-ink-300 dark:hover:text-signal-300">
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      <section className="mt-8 overflow-hidden rounded-md border border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-subtle-grid bg-[size:28px_28px] opacity-60 dark:bg-subtle-grid-dark" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-signal-200 bg-white text-signal-700 dark:border-signal-900 dark:bg-ink-900 dark:text-signal-300">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">Topic Hub</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink-950 sm:text-4xl dark:text-white">
              {topic.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-ink-600 dark:text-ink-300">{topic.description}</p>
            <p className="mt-4 text-sm font-semibold leading-7 text-ink-800 dark:text-ink-100">{topic.slogan}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {topic.keywords.map((keyword) => (
                <span key={keyword} className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <SectionTitle
            eyebrow="Articles"
            title={`${topic.title}文章`}
            description={`共 ${posts.length} 篇文章，按发布时间倒序排列。`}
          />
          <div className="grid gap-4">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-md border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
            <p className="text-sm font-semibold text-ink-950 dark:text-white">相关主题</p>
            <div className="mt-4 grid gap-2">
              {relatedTopics.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="flex items-center justify-between rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-signal-700 dark:hover:text-signal-300"
                >
                  {item.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
            <p className="text-sm font-semibold text-ink-950 dark:text-white">继续筛选</p>
            <Link
              href={`/blog?category=${encodeURIComponent(topic.category)}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-800 dark:bg-white dark:text-ink-950 dark:hover:bg-signal-100"
            >
              去博客页搜索该分类
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
