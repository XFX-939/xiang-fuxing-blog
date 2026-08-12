import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-bg xl:min-h-[calc(100svh-4.25rem)]">
        <div className="signal-grid absolute inset-y-0 right-0 -z-20 hidden w-[44%] opacity-45 xl:block" />
        <div className="absolute -right-24 top-16 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 px-5 sm:px-8 xl:min-h-[calc(100svh-4.25rem)] xl:grid-cols-12 xl:px-14">
          <div className="flex flex-col justify-between border-border py-10 sm:py-12 xl:col-span-8 xl:border-r xl:py-20">
            <div className="flex items-center justify-between gap-5 pr-0 lg:pr-12">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.19em] text-muted">
                Xiang Fuxing / Field Notes
              </p>
              <ArrowDownRight className="hidden h-5 w-5 text-accent sm:block" aria-hidden="true" />
            </div>

            <div className="max-w-6xl py-10 pr-0 sm:py-12 xl:py-16 xl:pr-12" data-reveal>
              <h1 className="max-w-6xl font-serif text-[2.55rem] font-normal leading-[0.95] tracking-[-0.055em] text-primary min-[400px]:text-[2.75rem] sm:text-[clamp(3.15rem,5.8vw,6rem)] sm:leading-[0.93] sm:tracking-[-0.065em]">
                <span className="block">把复杂系统，</span>
                <span className="block text-denim dark:text-[#8fb6bf]">变成可验证的判断。</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-secondary sm:mt-8 sm:text-lg sm:leading-9">
                向福星，系统型工程实践者。记录无线通信、系统仿真、AI 辅助研发与技术管理，把长期工作中的判断沉淀成可以复用的方法。
              </p>
              <div className="mt-7 flex gap-3 sm:mt-9">
                <Link
                  href="/blog"
                  className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-bg transition hover:bg-accent-bright hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none sm:gap-3 sm:px-6"
                >
                  开始阅读
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/projects"
                  className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-primary bg-surface/60 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none sm:gap-3 sm:px-6"
                >
                  浏览项目
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 border-t border-border pt-4 pr-0 text-sm font-medium leading-6 text-secondary sm:grid-cols-3 sm:gap-4 sm:pt-5 xl:pr-12">
              {[
                "无线算法与系统仿真",
                "AI 辅助研发与工具链",
                "技术管理与组织协同"
              ].map((item, index) => (
                <p key={item} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
                  <span className="font-mono text-xs font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
      </div>

      <div className="relative flex items-center py-8 sm:py-10 xl:col-span-4 xl:min-h-0 xl:pl-8 xl:py-20">
        <div className="signal-grid absolute -inset-x-5 inset-y-0 -z-10 opacity-45 sm:-inset-x-8 xl:hidden" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[44rem] xl:ml-auto xl:max-w-[30rem]" data-reveal>
              <div className="group relative aspect-[4/3] w-full overflow-hidden bg-denim sm:aspect-[5/3] md:aspect-[2/1] xl:aspect-[4/5]">
                <Image
                  src="/images/xiang-fuxing-profile.jpg"
                  alt="向福星个人照片"
                  fill
                  priority
                  sizes="(max-width: 1279px) 92vw, 34vw"
                  className="object-cover object-[50%_31%] grayscale-[0.08] contrast-[1.04] transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102d34]/45 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 border-t border-white/40 pt-3 text-white sm:inset-x-7 sm:bottom-7">
                  <p className="max-w-[17rem] text-sm leading-6 text-white/90">在工程、知识与组织之间建立长期连接。</p>
                  <span className="font-mono text-xs tracking-[0.12em]">SHANGHAI</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 h-24 w-24 border-b-0 border-l border-t border-accent-bright sm:h-32 sm:w-32 xl:-left-4" aria-hidden="true" />
            </div>
          </div>
        </div>
    </section>
  );
}
