import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { HomeMotion } from "@/components/HomeMotion";
import { PrincipleCarousel } from "@/components/PrincipleCarousel";
import { getLatestPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { topicHubs } from "@/lib/topics";
import { createMetadata, formatDate } from "@/lib/utils";

export const metadata = createMetadata();

const topicGridClasses = [
  "md:col-span-5 md:row-span-2",
  "md:col-span-7",
  "md:col-span-4",
  "md:col-span-3"
];

const stackTop = ["7rem", "8.5rem", "10rem"];

const manifesto = {
  lead: ["工程经验的价值，", "不在于漂亮的结论。"],
  detail: "它更应该说明问题的边界、成立的假设和支撑判断的证据。",
  outcome: "这样，经验才能被复盘，也能在下一次实践里继续验证。"
};

export default function HomePage() {
  const latestPosts = getLatestPosts(4);
  const selectedProjects = ["openclaw-multi-agent-team", "netcraft-6g", "FilePilot"]
    .map((name) => projects.find((project) => project.name === name))
    .filter((project): project is (typeof projects)[number] => Boolean(project));

  return (
    <HomeMotion>
      <HeroSection />

      <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-10 xl:px-14" aria-labelledby="latest-heading">
        <div className="mb-10 grid gap-6 border-t border-border pt-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end" data-reveal>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Latest signal</p>
            <h2 id="latest-heading" className="mt-4 font-serif text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
              最近在写
            </h2>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-secondary sm:text-base">
              从无线系统机制，到 AI 驱动的研发工作流，再到团队与个人的长期成长。这里记录仍在发生的思考。
            </p>
            <Link href="/blog" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-accent">
              查看全部文章
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="grid border-l border-t border-border lg:grid-cols-12 lg:grid-rows-3" data-reveal>
          {latestPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={post.url}
              className={`group relative flex min-w-0 flex-col justify-between overflow-hidden border-b border-r border-border bg-surface/50 transition-colors duration-500 hover:bg-surface ${
                index === 0
                  ? "min-h-[28rem] p-7 sm:p-9 lg:col-span-7 lg:row-span-3 lg:min-h-[35rem] lg:p-11"
                  : "min-h-[13rem] p-6 sm:p-7 lg:col-span-5 lg:row-span-1 lg:min-h-0"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="h-4 w-4 text-accent transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className={index === 0 ? "mt-10 h-px w-12 bg-accent-bright transition-all duration-700 group-hover:w-full" : "mt-5 h-px w-8 bg-accent-bright transition-all duration-700 group-hover:w-20"} />
                <p className="mt-5 text-xs font-semibold tracking-[0.08em] text-accent">{post.category}</p>
                <h3 className={`mt-3 font-serif leading-[1.14] tracking-[-0.035em] text-primary ${index === 0 ? "max-w-3xl text-[clamp(2.4rem,4vw,4.8rem)]" : "line-clamp-2 text-2xl sm:text-[1.7rem]"}`}>
                  {post.title}
                </h3>
                {index === 0 ? (
                  <p className="mt-6 line-clamp-3 max-w-2xl text-base leading-8 text-secondary">{post.description}</p>
                ) : null}
              </div>
              <div className={`flex items-center justify-between border-t border-border pt-4 text-xs text-muted ${index === 0 ? "mt-10" : "mt-5"}`}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>{post.readingTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface-elevated/40" aria-labelledby="map-heading">
        <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-10 xl:px-14">
          <div className="mb-12 max-w-4xl" data-reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Knowledge map</p>
            <h2 id="map-heading" className="mt-5 font-serif text-[clamp(2.8rem,6vw,6.4rem)] leading-[0.98] tracking-[-0.055em] text-primary">
              四条主线，组成一张持续生长的知识地图。
            </h2>
          </div>

          <div className="grid grid-flow-dense grid-cols-1 border-l border-t border-border md:auto-rows-[17rem] md:grid-cols-12" data-reveal>
            {topicHubs.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.slug}
                  href={topic.href}
                  className={`group relative flex min-h-[17rem] flex-col justify-between overflow-hidden border-b border-r border-border p-6 transition-colors duration-500 sm:p-8 ${topicGridClasses[index]} ${index === 0 ? "bg-denim text-[#f7f1e7]" : "bg-surface/50 hover:bg-surface"}`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className={`font-mono text-[10px] tracking-[0.16em] ${index === 0 ? "text-white/60" : "text-muted"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className={`h-5 w-5 ${index === 0 ? "text-[#f3a082]" : "text-accent"}`} />
                  </div>
                  <div>
                    <h3 className={`font-serif text-3xl leading-none tracking-[-0.035em] sm:text-4xl ${index === 0 ? "text-white" : "text-primary"}`}>
                      {topic.title}
                    </h3>
                    <p className={`mt-4 max-w-xl text-sm leading-7 ${index === 0 ? "text-white/70" : "text-secondary"}`}>
                      {topic.slogan}
                    </p>
                    <div className={`mt-5 h-px w-12 transition-all duration-700 group-hover:w-full ${index === 0 ? "bg-[#f3a082]" : "bg-accent-bright"}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-10 xl:px-14" aria-labelledby="manifesto-heading">
        <div className="grid gap-10 border-y border-border py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-7">
            <h2
              id="manifesto-heading"
              data-scrub-line
              className="max-w-[22ch] font-serif text-[clamp(2.25rem,4vw,4.5rem)] leading-[1.1] tracking-[-0.03em] text-primary"
            >
              {manifesto.lead.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <div className="flex max-w-2xl flex-col justify-end gap-5 lg:col-span-5 lg:pb-1">
            <p data-scrub-line className="text-base leading-8 text-secondary sm:text-lg sm:leading-9">
              {manifesto.detail}
            </p>
            <p data-scrub-line className="border-l-2 border-accent-bright pl-5 text-base font-medium leading-8 text-primary sm:text-lg sm:leading-9">
              {manifesto.outcome}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-elevated/40" aria-labelledby="projects-heading">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.62fr_1.38fr] lg:px-10 xl:px-14">
          <div className="h-fit lg:sticky lg:top-28" data-reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Selected work</p>
            <h2 id="projects-heading" className="mt-5 max-w-lg font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-primary sm:text-6xl">
              把想法做成可以运行的系统。
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-secondary sm:text-base">
              从 6G 策略仿真到个人量化研究，再到本地优先工具。项目用来验证方法，也暴露真正的问题。
            </p>
            <Link href="/projects" className="group mt-8 inline-flex items-center gap-2 border-b border-primary pb-1 text-sm font-semibold text-primary hover:border-accent hover:text-accent">
              浏览全部项目
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-7 pb-4">
            {selectedProjects.map((project, index) => {
              const projectLink = project.links[0];
              return (
                <article
                  key={project.name}
                  data-stack-card
                  className={`min-h-[29rem] border border-border p-6 shadow-soft sm:p-9 lg:sticky lg:p-11 ${index === 1 ? "bg-denim text-[#f7f1e7]" : index === 2 ? "bg-[#dcd4c7] text-[#161a19] dark:bg-[#29322e] dark:text-[#eee8dc]" : "bg-surface text-primary"}`}
                  style={{ top: stackTop[index] }}
                >
                  <div className="flex items-start justify-between gap-6 border-b border-current/20 pb-5">
                    <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${index === 1 ? "text-white/60" : "opacity-60"}`}>
                      {project.direction}
                    </p>
                    <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] ${index === 1 ? "text-[#f3a082]" : "text-accent"}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="grid gap-9 pt-8 md:grid-cols-[1.08fr_0.92fr]">
                    <div>
                      <p className={`font-mono text-[10px] tracking-[0.18em] ${index === 1 ? "text-white/50" : "opacity-60"}`}>
                        WORK {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-5 break-words font-display text-[clamp(2.6rem,6vw,5.4rem)] font-medium leading-[0.9] tracking-[-0.06em]">
                        {project.name}
                      </h3>
                      <p className={`mt-7 text-sm leading-7 sm:text-base ${index === 1 ? "text-white/70" : "opacity-75"}`}>
                        {project.description}
                      </p>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="grid gap-4">
                        {project.outcomes.slice(0, 2).map((outcome) => (
                          <p key={outcome} className={`flex gap-3 text-sm leading-6 ${index === 1 ? "text-white/70" : "opacity-75"}`}>
                            <Check className={`mt-1 h-4 w-4 shrink-0 ${index === 1 ? "text-[#f3a082]" : "text-accent"}`} />
                            <span>{outcome}</span>
                          </p>
                        ))}
                      </div>
                      <div className="mt-9">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.08em] opacity-60">
                          {project.technologies.slice(0, 4).map((technology) => (
                            <span key={technology}>{technology}</span>
                          ))}
                        </div>
                        {projectLink ? (
                          <a
                            href={projectLink.href}
                            target="_blank"
                            rel="noreferrer"
                            className={`group mt-7 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-semibold ${index === 1 ? "hover:border-[#f3a082] hover:text-[#f3a082]" : "hover:border-accent hover:text-accent"}`}
                          >
                            {projectLink.label}
                            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PrincipleCarousel />

      <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-10 xl:px-14" data-reveal>
        <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
          <h2 className="max-w-5xl font-serif text-[clamp(3rem,7vw,7.5rem)] leading-[0.94] tracking-[-0.06em] text-primary">
            如果你也在处理复杂问题，我们可以交换彼此的判断。
          </h2>
          <div className="lg:pb-3">
            <p className="text-sm leading-7 text-secondary">技术内容、工具产品、知识系统与长期共创。</p>
            <Link
              href="/collaboration"
              className="group mt-6 inline-flex min-h-12 items-center gap-3 bg-accent-bright px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              查看合作方式
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </HomeMotion>
  );
}
