import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { HeroSection } from "@/components/HeroSection";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getFeaturedPosts, getLatestPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata();

const methodologyItems = [
  "先把问题放进系统里看，再决定用算法、工程还是组织动作解决",
  "把关键判断写下来，让复杂工作可以被复盘、传递和迭代",
  "用 AI 加速阅读、草拟和验证，但最终判断仍由人负责",
  "把目标、方法、执行、复盘串成稳定节奏，而不是靠临场发挥"
];

const readingPaths = [
  {
    title: "如果你关注无线系统仿真",
    description: "从《一文读懂系统仿真》开始，再读资源分配、SVD/EVD、数字孪生相关内容。",
    links: [
      { href: "/blog/understanding-system-simulation", label: "一文读懂系统仿真" },
      { href: "/blog/wireless-channel-resource-allocation-study-card", label: "信道资源分配" },
      { href: "/blog/svd-evd-eigenvalue-algorithms-wireless", label: "SVD/EVD" },
      { href: "/projects", label: "数字孪生探索" }
    ]
  },
  {
    title: "如果你关注 AI Coding",
    description: "从《AI辅助研发不是替代程序员，而是重构研发作业流》开始，再读 Obsidian、知识管理和 AI 工作流。",
    links: [
      { href: "/blog/ai-rd-workflow", label: "AI 辅助研发作业流" },
      { href: "/blog/obsidian-thinking-action-system", label: "Obsidian 工作流" },
      { href: "/blog/codeagent-ai-coding-boundaries", label: "CodeAgent 实践" }
    ]
  },
  {
    title: "如果你关注技术管理",
    description: "从《技术管理者如何做好目标、方法、执行和复盘》开始，再读个人成长复盘。",
    links: [
      { href: "/blog/technical-management-four-steps", label: "目标、方法、执行、复盘" },
      { href: "/blog/from-executor-to-system-owner", label: "系统型负责人复盘" },
      { href: "/methodology", label: "我的方法论" }
    ]
  }
];

export default function HomePage() {
  const latestPosts = getLatestPosts(4);
  const featuredPosts = getFeaturedPosts(3);

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle
          eyebrow="Start Here"
          title="第一次来，建议这样读"
          description="不同入口对应不同问题。先沿着一条路径读下去，比直接翻标签更容易建立完整理解。"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {readingPaths.map((path) => (
            <article key={path.title} className="rounded-md border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
              <h2 className="text-lg font-semibold text-ink-950 dark:text-white">{path.title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">{path.description}</p>
              <div className="mt-5 grid gap-2">
                {path.links.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-signal-300 hover:text-signal-700 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200 dark:hover:border-signal-700 dark:hover:text-signal-300"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-signal-700 dark:text-signal-300">{String(index + 1).padStart(2, "0")}</span>
                      {link.label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle
          eyebrow="Latest"
          title="最新文章"
          description="记录技术判断、工程方法和管理复盘。内容不追求热闹，优先追求可验证、可迁移、可长期沉淀。"
          action={
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-signal-700 hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100">
              全部文章
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {latestPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="border-y border-ink-200 bg-ink-50/80 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionTitle
            eyebrow="Featured"
            title="精选文章"
            description="这些文章更接近个人知识体系的主干：从系统仿真、AI 辅助研发到技术管理方法。"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle
          eyebrow="Projects"
          title="代表性项目"
          description="项目不是为了展示名词，而是沉淀我在平台建设、模型可信、工具链效率和团队推动中的实际经验。"
          action={
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-signal-700 hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100">
              查看项目页
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>

      <section className="border-t border-ink-200 bg-ink-950 text-white dark:border-ink-800">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-300">Methodology</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">个人方法论</h2>
            <p className="mt-4 text-sm leading-7 text-ink-300">
              我更相信长期稳定的工作系统：清楚目标，拆出关键杠杆，持续推进，认真复盘。技术深度和管理视野，最终都要落在可执行的方法上。
            </p>
            <Link
              href="/methodology"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-signal-100"
            >
              查看方法论
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {methodologyItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-signal-300" />
                <p className="text-sm leading-7 text-ink-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
