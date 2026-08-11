import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";

const signalTerms = [
  "Wireless Systems",
  "System Simulation",
  "AI for Engineering",
  "Technical Leadership",
  "Decision Notes"
];

export function HeroSection() {
  const repeatedTerms = [...signalTerms, ...signalTerms];

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden border-b border-border bg-bg">
        <div className="signal-grid absolute inset-y-0 right-0 -z-20 w-[44%] opacity-45" />
        <div className="absolute -right-24 top-16 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
        <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[90rem] grid-cols-1 px-5 sm:px-8 lg:grid-cols-12 lg:px-10 xl:px-14">
          <div className="flex flex-col justify-between border-border py-12 sm:py-16 lg:col-span-8 lg:border-r lg:py-20 xl:py-24">
            <div className="flex items-center justify-between gap-5 pr-0 lg:pr-12">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.19em] text-muted">
                Xiang Fuxing / Field Notes
              </p>
              <ArrowDownRight className="hidden h-5 w-5 text-accent sm:block" aria-hidden="true" />
            </div>

            <div className="max-w-6xl py-14 pr-0 lg:py-20 lg:pr-12" data-reveal>
              <h1 className="max-w-6xl font-serif text-[clamp(3.15rem,5.8vw,6rem)] font-normal leading-[0.93] tracking-[-0.065em] text-primary">
                <span className="block">把复杂系统，</span>
                <span className="block text-denim dark:text-[#8fb6bf]">变成可验证的判断。</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-secondary sm:text-lg sm:leading-9">
                向福星，系统型工程实践者。记录无线通信、系统仿真、AI 辅助研发与技术管理，把长期工作中的判断沉淀成可以复用的方法。
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/blog"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 bg-primary px-6 py-3 text-sm font-semibold text-bg transition hover:bg-accent-bright hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  开始阅读
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/projects"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 border border-primary bg-surface/60 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  浏览项目
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 border-t border-border pt-5 pr-0 font-mono text-[11px] leading-5 text-muted sm:grid-cols-3 lg:pr-12">
              <p>无线算法与系统仿真</p>
              <p>AI 辅助研发与工具链</p>
              <p>技术管理与组织协同</p>
            </div>
          </div>

          <div className="relative flex min-h-[38rem] items-end pb-8 pt-2 sm:min-h-[46rem] lg:col-span-4 lg:pb-20 lg:pl-8 lg:pt-28 xl:pl-10">
            <div className="absolute left-4 top-12 hidden h-40 w-px bg-border lg:block" />
            <p className="absolute left-8 top-14 hidden origin-left rotate-90 font-mono text-[10px] uppercase tracking-[0.18em] text-muted lg:block">
              Engineer / Writer / Builder
            </p>
            <div className="group relative ml-auto aspect-[4/5] w-[92%] max-w-[30rem] overflow-hidden bg-denim sm:w-[78%] lg:w-full" data-reveal>
              <Image
                src="/images/xiang-fuxing-profile.jpg"
                alt="向福星个人照片"
                fill
                priority
                sizes="(max-width: 1024px) 78vw, 34vw"
                className="object-cover object-[50%_31%] grayscale-[0.08] contrast-[1.04] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102d34]/40 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between border-t border-white/40 pt-3 text-white sm:inset-x-7 sm:bottom-7">
                <p className="max-w-[12rem] text-xs leading-5 text-white/80">在工程、知识与组织之间建立长期连接。</p>
                <span className="font-mono text-[10px] tracking-[0.18em]">SHANGHAI</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-28 w-28 border-l border-t border-accent-bright sm:h-36 sm:w-36 lg:-left-4 lg:bottom-12" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-border bg-denim py-4 text-[#f7f1e7]" aria-label="博客主题">
        <div className="signal-marquee flex w-max motion-reduce:transform-none">
          {repeatedTerms.map((term, index) => (
            <span key={`${term}-${index}`} className="flex items-center font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="px-6 sm:px-9">{term}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#f08a64]" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
