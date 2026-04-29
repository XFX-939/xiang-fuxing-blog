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
    <section className="relative w-full max-w-full overflow-hidden border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="absolute inset-0 bg-subtle-grid bg-[size:28px_28px] opacity-70 dark:bg-subtle-grid-dark" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-signal-100/80 to-transparent dark:from-signal-950/30" />
      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-9 sm:px-6 sm:pb-14 sm:pt-11 lg:pb-14 lg:pt-12">
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-10">
          <div className="min-w-0 max-w-none">
            <p className="mb-5 hidden rounded-md border border-signal-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-signal-800 sm:inline-flex dark:border-signal-900 dark:bg-ink-950/70 dark:text-signal-300">
              Personal Knowledge System
            </p>
            <h1 className="max-w-[18rem] text-[30px] font-semibold leading-[1.22] tracking-[-0.02em] text-ink-950 min-[390px]:max-w-[19rem] sm:max-w-4xl sm:text-5xl sm:tracking-normal lg:max-w-none lg:text-[clamp(2.4rem,4vw,2.75rem)] xl:whitespace-nowrap 2xl:text-5xl dark:text-white">
              用 AI 重构复杂工程问题的建模、仿真与决策
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-signal-800 sm:text-base dark:text-signal-200">
              <span className="sm:hidden">AI 驱动复杂工程系统工作流。</span>
              <span className="hidden sm:inline">Building AI-driven workflows for complex engineering systems.</span>
            </p>
            <p className="mt-5 hidden max-w-3xl text-sm font-semibold leading-7 text-ink-800 md:block dark:text-ink-100">
              个人定位：无线通信算法工程师 / 系统仿真平台建设者 / AI 辅助研发推动者 / 技术管理实践者
            </p>
            <p className="mt-5 hidden max-w-3xl text-base leading-8 text-ink-600 md:block dark:text-ink-300">
              我长期关注AI For Science、无线通信系统仿真、研发效能提升与技术团队管理。这个博客用于沉淀技术认知、管理复盘和个人成长方法论。
            </p>
            <div className="mt-6 hidden gap-3 text-sm text-ink-700 md:grid md:grid-cols-3 dark:text-ink-200">
              {positionSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-2 rounded-md border border-ink-200 bg-white/72 p-3 dark:border-ink-800 dark:bg-ink-950/60">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-700 dark:text-signal-300" />
                  <span className="leading-6">{signal}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid max-w-full grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
              <div className="grid gap-4 lg:flex lg:h-full lg:flex-col">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/blog"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-800 dark:bg-white dark:text-ink-950 dark:hover:bg-signal-100"
                  >
                    阅读文章
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-300 bg-white/80 px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-signal-400 hover:text-signal-700 dark:border-ink-700 dark:bg-ink-950/70 dark:text-ink-100 dark:hover:border-signal-600 dark:hover:text-signal-300"
                  >
                    查看项目
                  </Link>
                </div>
                <ProfilePhotoCard compact />
              </div>
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
    <div className="hidden h-full rounded-md border border-ink-200 bg-white/78 p-5 shadow-sm backdrop-blur lg:block dark:border-ink-800 dark:bg-ink-950/76">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">Start Here</p>
          <h2 className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">第一次来，建议这样读</h2>
        </div>
        <Link href="/blog" className="shrink-0 text-sm font-semibold text-signal-700 hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100">
          全部文章
        </Link>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {heroReadingPaths.map((path) => (
          <Link
            key={path.title}
            href={path.href}
            className="group min-w-0 rounded-md border border-ink-200 bg-ink-50/80 p-4 transition hover:-translate-y-0.5 hover:border-signal-300 hover:bg-white dark:border-ink-800 dark:bg-ink-900/64 dark:hover:border-signal-700 dark:hover:bg-ink-900"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-6 text-ink-950 dark:text-white">{path.title}</h3>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-signal-700 opacity-0 transition group-hover:opacity-100 dark:text-signal-300" />
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-600 dark:text-ink-300">{path.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProfilePhotoCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-md border border-ink-200 bg-white/86 p-2 shadow-soft backdrop-blur dark:border-ink-800 dark:bg-ink-950/82 dark:shadow-soft-dark ${compact ? "lg:flex lg:flex-1 lg:items-center" : ""}`}>
      <div className={compact ? "grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[104px_minmax(0,1fr)] lg:w-full lg:grid-cols-[132px_minmax(0,1fr)] lg:gap-4" : ""}>
        <div className={compact ? "relative aspect-square overflow-hidden rounded-md bg-ink-100 dark:bg-ink-900" : "relative aspect-[4/5] overflow-hidden rounded-md bg-ink-100 dark:bg-ink-900"}>
          <Image
            src="/images/xiang-fuxing-profile.jpg"
            alt="向福星个人照片"
            fill
            priority={!compact}
            sizes={compact ? "(max-width: 640px) 88px, (max-width: 1024px) 104px, 132px" : "320px"}
            className="object-cover object-[50%_32%]"
          />
        </div>
        <div className={compact ? "min-w-0 px-1 py-2" : "px-2 py-3"}>
          <p className="text-sm font-semibold text-ink-950 dark:text-white">向福星</p>
          <p className="mt-1 text-xs leading-5 text-ink-500 dark:text-ink-400">
            Wireless Simulation · AI for Engineering
          </p>
        </div>
      </div>
    </div>
  );
}
