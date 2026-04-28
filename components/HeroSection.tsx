import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, Layers3, RadioTower } from "lucide-react";

const directions = [
  {
    title: "无线通信与系统仿真",
    description: "围绕 5G/6G、系统级仿真、KPI 评估、Trace 分析与数字孪生可信建模。",
    icon: RadioTower
  },
  {
    title: "AI辅助研发与工程效率",
    description: "把 AI Coding、知识库、工具链和研发流程连接起来，让工程判断更快落地。",
    icon: BrainCircuit
  },
  {
    title: "技术管理与个人成长",
    description: "沉淀目标拆解、协同节奏、会议表达、人才发展与复盘闭环的真实经验。",
    icon: Layers3
  }
];

const positionSignals = [
  "从无线通信算法到系统级仿真平台",
  "从 AI Coding 实践到研发作业流重构",
  "从个人技术判断到团队协同与组织推进"
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="absolute inset-0 bg-subtle-grid bg-[size:28px_28px] opacity-70 dark:bg-subtle-grid-dark" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-signal-100/80 to-transparent dark:from-signal-950/30" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-4xl xl:max-w-none">
            <p className="mb-5 inline-flex rounded-md border border-signal-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-signal-800 dark:border-signal-900 dark:bg-ink-950/70 dark:text-signal-300">
              Personal Knowledge System
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-ink-950 sm:text-5xl lg:max-w-none lg:whitespace-nowrap lg:text-[2.6rem] xl:text-[2.75rem] 2xl:text-5xl dark:text-white">
              用 AI 重构复杂工程问题的建模、仿真与决策
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-signal-800 dark:text-signal-200">
              Building AI-driven workflows for complex engineering systems.
            </p>
            <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-ink-800 dark:text-ink-100">
              个人定位：无线通信算法工程师 / 系统仿真平台建设者 / AI 辅助研发推动者 / 技术管理实践者
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-ink-600 dark:text-ink-300">
              我长期关注AI For Science、无线通信系统仿真、研发效能提升与技术团队管理。这个博客用于沉淀技术认知、管理复盘和个人成长方法论。
            </p>
            <div className="mt-6 grid gap-3 text-sm text-ink-700 sm:grid-cols-3 dark:text-ink-200">
              {positionSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-2 rounded-md border border-ink-200 bg-white/72 p-3 dark:border-ink-800 dark:bg-ink-950/60">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-700 dark:text-signal-300" />
                  <span className="leading-6">{signal}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-md bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-800 dark:bg-white dark:text-ink-950 dark:hover:bg-signal-100"
              >
                阅读文章
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md border border-ink-300 bg-white/80 px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-signal-400 hover:text-signal-700 dark:border-ink-700 dark:bg-ink-950/70 dark:text-ink-100 dark:hover:border-signal-600 dark:hover:text-signal-300"
              >
                查看项目
              </Link>
            </div>
          </div>

          <div className="hidden xl:block">
            <div className="rounded-md border border-ink-200 bg-white/86 p-2 shadow-soft backdrop-blur dark:border-ink-800 dark:bg-ink-950/82 dark:shadow-soft-dark">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-ink-100 dark:bg-ink-900">
                <Image
                  src="/images/xiang-fuxing-profile.jpg"
                  alt="向福星个人照片"
                  fill
                  priority
                  sizes="(min-width: 1536px) 320px, 280px"
                  className="object-cover object-[50%_32%]"
                />
              </div>
              <div className="px-2 py-3">
                <p className="text-sm font-semibold text-ink-950 dark:text-white">向福星</p>
                <p className="mt-1 text-xs leading-5 text-ink-500 dark:text-ink-400">
                  Wireless Simulation · AI for Engineering
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {directions.map((direction) => {
            const Icon = direction.icon;
            return (
              <article
                key={direction.title}
                className="rounded-md border border-ink-200 bg-white/88 p-5 shadow-sm backdrop-blur dark:border-ink-800 dark:bg-ink-950/82"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-signal-50 text-signal-700 dark:bg-signal-950 dark:text-signal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-ink-950 dark:text-white">{direction.title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">{direction.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
