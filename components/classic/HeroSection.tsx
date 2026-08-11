import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const positionSignals = [
  "从无线通信算法到系统级仿真平台",
  "从 AI Coding 实践到研发作业流重构",
  "从个人技术判断到团队协同与组织推进"
];

const heroReadingPaths = [
  {
    title: "复杂工程建模 / 系统仿真",
    description: "从系统仿真切入，再连接资源分配、SVD/EVD 与数字孪生。",
    href: "/blog/understanding-system-simulation"
  },
  {
    title: "AI Coding / 研发工程化",
    description: "理解 AI 如何进入研发流程，而不是停留在工具尝鲜。",
    href: "/blog/ai-rd-workflow"
  },
  {
    title: "技术管理 / 个人成长",
    description: "从目标、方法、执行、复盘开始，建立可迁移的做事系统。",
    href: "/blog/technical-management-four-steps"
  }
];

export function HeroSection() {
  return (
    <section className="relative w-full max-w-full overflow-hidden border-b border-border bg-surface-elevated">
      <div className="absolute inset-0 bg-subtle-grid bg-[size:28px_28px] opacity-70 dark:bg-subtle-grid-dark" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-accent-soft to-transparent" />
      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-9 sm:px-6 sm:pb-14 sm:pt-11 lg:pb-14 lg:pt-12">
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-10">
          <div className="min-w-0 max-w-none">
            <p className="mb-5 hidden rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:inline-flex">
              Personal Knowledge System
            </p>
            <h1 className="max-w-[18rem] text-[30px] font-semibold leading-[1.22] tracking-[-0.02em] text-primary min-[390px]:max-w-[19rem] sm:max-w-4xl sm:text-5xl sm:tracking-normal lg:max-w-none lg:text-[clamp(2.4rem,4vw,2.75rem)] xl:whitespace-nowrap 2xl:text-5xl">
              用 AI 重构复杂工程问题的建模、仿真与决策
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-accent sm:text-base">
              <span className="sm:hidden">AI 驱动复杂工程系统工作流。</span>
              <span className="hidden sm:inline">Building AI-driven workflows for complex engineering systems.</span>
            </p>
            <p className="mt-5 hidden max-w-3xl text-sm font-semibold leading-7 text-primary md:block">
              个人定位：无线通信算法工程师 / 系统仿真平台建设者 / AI 辅助研发推动者 / 技术管理实践者
            </p>
            <p className="mt-5 hidden max-w-3xl text-base leading-8 text-secondary md:block">
              我长期关注AI For Science、无线通信系统仿真、研发效能提升与技术团队管理。这个博客用于沉淀技术认知、管理复盘和个人成长方法论。
            </p>
            <div className="mt-6 hidden gap-3 text-sm text-secondary md:grid md:grid-cols-3">
              {positionSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-2 rounded-md border border-border bg-surface p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="leading-6">{signal}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid max-w-full grid-cols-1 items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
              <AuthorEntryCard />
              <HeroReadingGuide />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function HeroReadingGuide() {
  return (
    <section className="rounded-md border border-border bg-surface p-5 shadow-sm backdrop-blur dark:shadow-soft-dark">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Start Here</p>
          <h2 className="mt-2 text-lg font-semibold text-primary">第一次来，建议这样读</h2>
        </div>
        <Link href="/blog" className="shrink-0 text-sm font-semibold text-accent hover:opacity-80">
          全部文章
        </Link>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {heroReadingPaths.map((path) => (
          <Link
            key={path.title}
            href={path.href}
            className="group min-w-0 rounded-md border border-border bg-surface-elevated p-4 transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-6 text-primary">{path.title}</h3>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-secondary">{path.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AuthorEntryCard() {
  return (
    <aside className="rounded-md border border-border bg-surface p-4 shadow-soft backdrop-blur sm:p-5 dark:shadow-soft-dark">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-elevated sm:h-28 sm:w-28">
          <Image
            src="/images/xiang-fuxing-profile.jpg"
            alt="向福星个人照片"
            fill
            priority
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover object-[50%_32%]"
          />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-primary">向福星</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            <span className="block">Wireless Simulation</span>
            <span className="block">AI for Engineering</span>
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 max-[379px]:grid-cols-1">
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
        >
          阅读文章
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
        >
          查看项目
        </Link>
      </div>
    </aside>
  );
}
