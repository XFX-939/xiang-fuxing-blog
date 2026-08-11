import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ArticleCard } from "@/components/classic/ArticleCard";
import { HeroSection } from "@/components/classic/HeroSection";
import { ProjectCard } from "@/components/classic/ProjectCard";
import { SectionTitle } from "@/components/classic/SectionTitle";
import { getFeaturedPosts, getLatestPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { topicHubs } from "@/lib/topics";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata();

const methodologyItems = [
  "先把问题放进系统里看，再决定用算法、工程还是组织动作解决",
  "把关键判断写下来，让复杂工作可以被复盘、传递和迭代",
  "用 AI 加速阅读、草拟和验证，但最终判断仍由人负责",
  "把目标、方法、执行、复盘串成稳定节奏，而不是靠临场发挥"
];

export default function HomePage() {
  const latestPosts = getLatestPosts(4);
  const featuredPosts = getFeaturedPosts(3);

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <SectionTitle
          eyebrow="Topic Hubs"
          title="四个长期写作主线"
          description="按主题进入，比按时间浏览更适合建立知识结构。每个聚合页都会持续沉淀同一类问题的文章。"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topicHubs.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.slug}
                href={topic.href}
                className="group rounded-[18px] border border-border bg-surface p-5 transition hover:border-accent hover:shadow-soft sm:rounded-md sm:p-6 dark:hover:shadow-soft-dark"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-primary transition group-hover:text-accent">
                  {topic.title}
                </h2>
                <p className="mt-3 line-clamp-2 text-sm leading-7 text-secondary md:line-clamp-none">{topic.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  进入专题
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <SectionTitle
          eyebrow="Latest"
          title="最新文章"
          description="记录技术判断、工程方法和管理复盘。内容不追求热闹，优先追求可验证、可迁移、可长期沉淀。"
          action={
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary">
              全部文章
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {latestPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
          <SectionTitle
            eyebrow="Featured"
            title="精选文章"
            description="这些文章更接近个人知识体系的主干：从系统仿真、AI 辅助研发到技术管理方法。"
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <SectionTitle
          eyebrow="Projects"
          title="代表性项目"
          description="项目不是为了展示名词，而是沉淀我在平台建设、模型可信、工具链效率和团队推动中的实际经验。"
          action={
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary">
              查看项目页
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Collaboration</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-normal text-primary sm:text-3xl">
                合作与交流
              </h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-secondary sm:text-sm">
                如果你在做技术内容、工具产品、知识社群或个人品牌建设，欢迎围绕内容互推、项目共创、技术交流和资源连接做长期合作。
              </p>
            </div>
            <Link
              href="/collaboration"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
            >
              查看合作方式
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-elevated">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Methodology</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-normal text-primary sm:text-3xl">个人方法论</h2>
            <p className="mt-4 text-[15px] leading-7 text-secondary sm:text-sm">
              我更相信长期稳定的工作系统：清楚目标，拆出关键杠杆，持续推进，认真复盘。技术深度和管理视野，最终都要落在可执行的方法上。
            </p>
            <Link
              href="/methodology"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
            >
              查看方法论
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden gap-3 md:grid">
            {methodologyItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-border bg-surface p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm leading-7 text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
