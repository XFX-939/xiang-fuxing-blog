import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight, Github, Mail, MessageCircle, NotebookText, Video } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { siteConfig } from "@/lib/site";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "关于我",
  description: "关于向福星：无线通信算法工程师，关注系统仿真、AI辅助研发、研发效能和技术团队管理。",
  path: "/about"
});

const focusAreas = [
  "无线通信系统仿真",
  "5G/6G 网络演进",
  "AI for RAN",
  "数字孪生仿真",
  "研发工具链与 AI Coding",
  "技术团队管理",
  "个人知识管理",
  "音乐 and 篮球"
];

const skills = [
  "无线通信",
  "系统仿真",
  "5G/6G",
  "AI RAN",
  "AI For Science",
  "数字孪生",
  "MIMO",
  "资源分配",
  "功率控制",
  "移动性管理",
  "AMC",
  "SVD/EVD",
  "算法建模",
  "平台规划",
  "研发效能",
  "AI Coding",
  "CodeAgent",
  "Obsidian知识管理",
  "技术写作",
  "团队管理",
  "组织协同",
  "目标管理",
  "复盘方法"
];

const principles = [
  { title: "有目标", description: "先明确方向、指标和结果，让投入有清晰的约束。" },
  { title: "有方法", description: "拆解路径，抓住关键杠杆，避免把努力浪费在边缘问题上。" },
  { title: "有执行", description: "形成节奏，推进闭环，让复杂任务持续向前。" },
  { title: "有复盘", description: "总结经验，沉淀方法，把一次性结果变成可复用能力。" }
];

const cognitionGroups = [
  {
    title: "两个坚持，两个保持",
    description: "做选择的原则",
    items: ["坚持做正确且有挑战的事", "坚持独立思考和判断", "保持好奇心和求知欲", "保持乐观和韧性"]
  },
  {
    title: "系统性思维",
    description: "看问题的方式",
    items: ["定义边界", "拆系统结构", "抓关键变量", "看动态关系", "做权衡"]
  },
  {
    title: "资源整合能力",
    description: "把事情做成的能力",
    items: ["信息整合", "人的整合", "资源整合", "节奏整合"]
  }
];

const importantCognitions = [
  {
    title: "谋定而后动",
    description: "先想清楚目标、边界、关键变量、资源条件和主要风险，再进入执行。"
  },
  {
    title: "能成事、积极正向、会关注人",
    description: "长期价值不只看技术深度，也看能否闭环结果、提供正向能量，并理解和激发身边的人。"
  }
];

const valueTopics = [
  "无线通信系统仿真平台如何建设",
  "AI Coding 如何真正进入研发流程",
  "技术团队如何把经验沉淀成方法论",
  "工程师如何从执行者成长为系统型负责人"
];

export default function AboutPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <SectionTitle
          as="h1"
          variant="editorial"
          eyebrow="Wireless systems / AI-assisted R&D / Team practice"
          title="把复杂系统讲清楚，也把经验沉淀下来"
          description="技术深度、工程判断和组织协作，是我长期希望放在同一张工作地图里打磨的能力。"
        />

        <section className="relative border-y border-border" aria-labelledby="profile-title">
          <div className="grid items-stretch lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.52fr)]">
            <div className="relative z-10 flex flex-col justify-center py-10 lg:-mr-16 lg:py-20">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">向福星 / 无线通信算法工程师</p>
              <h2 id="profile-title" className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-primary">
                技术深度，工程判断，以及人与系统。
              </h2>
              <div className="mt-9 max-w-2xl border-l border-accent pl-5 sm:pl-7">
                <p className="text-[15px] leading-8 text-secondary sm:text-base">
                  我是无线通信算法工程师，长期从事系统仿真、5G/6G技术预研、AI辅助研发、研发效能提升和技术团队管理相关工作。
                </p>
                <p className="mt-4 text-[15px] leading-8 text-secondary sm:text-base">
                  我希望把复杂工程问题讲清楚，把技术经验沉淀成可复用的方法，也把个人成长和团队管理中的真实判断长期记录下来。
                </p>
              </div>
            </div>

            <figure className="group relative mx-auto min-h-[430px] w-full max-w-[34rem] overflow-hidden border-x border-border bg-surface-elevated sm:min-h-[560px] lg:mx-0 lg:max-w-none">
              <Image
                src="/images/xiang-fuxing-profile.jpg"
                alt="向福星个人照片"
                fill
                priority
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 100vw"
                className="object-cover object-[50%_30%] saturate-[0.82] contrast-[1.04] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.025] group-hover:saturate-100"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
              <figcaption className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:bottom-7 sm:left-7 sm:right-7">
                <span>Field portrait</span>
                <span>Systems / Signals / People</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="grid gap-10 border-b border-border py-20 sm:py-28 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="focus-title">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Research map</p>
            <h2 id="focus-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">我的关注方向</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-secondary">从空口算法到研发系统，我更关心变量之间的关系，而不是孤立的技术名词。</p>
          </header>

          <div>
            <div className="grid border-t border-border sm:grid-cols-2">
              {focusAreas.map((area, index) => (
                <div key={area} className="group flex min-h-24 items-start gap-4 border-b border-border py-5 sm:px-5 sm:odd:border-r sm:first:pl-0">
                  <span className="font-mono text-[10px] font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-base font-medium leading-7 text-primary transition-transform duration-300 group-hover:translate-x-1">{area}</span>
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-border pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] text-primary">我的能力标签</h3>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Capability index / {skills.length}</p>
              </div>
              <div className="mt-7 grid grid-cols-2 border-t border-border sm:grid-cols-3">
                {skills.map((skill) => (
                  <span key={skill} className="border-b border-border py-3 pr-3 text-sm leading-6 text-secondary transition-colors hover:text-accent sm:even:px-3">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-border py-20 sm:py-28 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="principles-title">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Operating rhythm</p>
            <h2 id="principles-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">我的工作原则</h2>
          </header>

          <div className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4">
            {principles.map((principle, index) => (
              <article key={principle.title} className="group min-h-64 border-b border-border p-5 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0">
                <span className="font-display text-5xl font-semibold tracking-[-0.05em] text-accent/25 transition-colors duration-300 group-hover:text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-10 text-lg font-semibold text-primary">{principle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-secondary">{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-border py-20 sm:py-28 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="cognition-title">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Cognitive frame</p>
            <h2 id="cognition-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">认知方法论</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-secondary">
              这些不是抽象口号，而是我在技术探索、工程交付和团队协同里反复使用的判断框架。
            </p>
          </header>

          <div>
            <div className="grid gap-0 border-y border-border lg:grid-cols-3">
              {cognitionGroups.map((group) => (
                <article key={group.title} className="border-b border-border py-7 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <p className="text-xs font-medium text-muted">{group.description}</p>
                  <h3 className="mt-2 min-h-14 text-lg font-semibold leading-7 text-primary">{group.title}</h3>
                  <ul className="mt-6 grid gap-3">
                    {group.items.map((item) => (
                      <li key={item} className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-secondary">
                        <span className="mt-[0.65rem] h-px w-3 bg-accent" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-12 grid gap-px bg-border md:grid-cols-2">
              {importantCognitions.map((item) => (
                <article key={item.title} className="bg-accent-soft p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">重要认知</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-primary">{item.title}</h3>
                  <p className="mt-5 text-sm leading-7 text-secondary">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-border py-20 sm:py-28 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="questions-title">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Long-term questions</p>
            <h2 id="questions-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">我正在长期沉淀的问题</h2>
          </header>

          <div>
            <p className="text-base font-semibold text-primary">欢迎非商业技术讨论</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary">如果你对以下公开技术问题有讨论，欢迎邮件交流：</p>
            <ol className="mt-8 border-b border-border">
              {valueTopics.map((topic, index) => (
                <li key={topic} className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-t border-border py-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-center">
                  <span className="font-mono text-xs font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-base leading-7 text-secondary transition-transform duration-300 group-hover:translate-x-2 group-hover:text-primary sm:text-lg">{topic}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-10 pt-20 sm:pt-28 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="contact-title">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Open channels</p>
            <h2 id="contact-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">联系我</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-secondary">关于公开技术问题、工程方法与写作交流，可以从以下渠道找到我。</p>
          </header>

          <div className="grid border-b border-border sm:grid-cols-2">
            <ContactLink href={`mailto:${siteConfig.email}`} icon={<Mail className="h-4 w-4" />} label="Email" value={siteConfig.email} />
            <ContactLink href={siteConfig.github} icon={<Github className="h-4 w-4" />} label="GitHub" value={siteConfig.githubName} external />
            <ContactLink href={siteConfig.zhihu} icon={<MessageCircle className="h-4 w-4" />} label="知乎" value={siteConfig.zhihuName} external />
            <ContactLink href={siteConfig.xiaohongshu} icon={<NotebookText className="h-4 w-4" />} label="小红书" value={siteConfig.xiaohongshuName} external />
            <ContactLink href={siteConfig.douyin} icon={<Video className="h-4 w-4" />} label="抖音" value={siteConfig.douyinName} external />
            <div className="group flex min-w-0 items-center gap-4 border-t border-border py-5 sm:px-5 sm:even:border-l">
              <MessageCircle className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-primary">微信</span>
                <span className="mt-1 block break-all text-xs text-muted">{siteConfig.wechat}</span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  label,
  value,
  external = false
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex min-w-0 items-center gap-4 border-t border-border py-5 transition-colors hover:bg-surface-elevated sm:px-5 sm:even:border-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
    >
      <span className="shrink-0 text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-primary transition-colors group-hover:text-accent">{label}</span>
        <span className="mt-1 block break-all text-xs text-muted">{value}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </a>
  );
}
