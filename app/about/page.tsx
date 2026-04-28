import Image from "next/image";
import type { ReactNode } from "react";
import { Github, Mail, MessageCircle, NotebookText, Video } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { Tag } from "@/components/Tag";
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
  "AI RAN",
  "数字孪生",
  "算法建模",
  "平台规划",
  "团队管理",
  "组织协同",
  "技术写作",
  "AI辅助研发",
  "Obsidian知识管理"
];

const principles = [
  { title: "有目标", description: "先明确方向、指标和结果，让投入有清晰的约束。" },
  { title: "有方法", description: "拆解路径，抓住关键杠杆，避免把努力浪费在边缘问题上。" },
  { title: "有执行", description: "形成节奏，推进闭环，让复杂任务持续向前。" },
  { title: "有复盘", description: "总结经验，沉淀方法，把一次性结果变成可复用能力。" }
];

const valueTopics = [
  "无线通信系统仿真平台如何建设",
  "AI Coding 如何真正进入研发流程",
  "技术团队如何把经验沉淀成方法论",
  "工程师如何从执行者成长为系统型负责人"
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="About"
        title="关于我"
        description="技术深度、工程判断和组织协作，是我长期希望放在同一张工作地图里打磨的能力。"
      />

      <div className="grid gap-6">
        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-ink-950 dark:text-white">个人简介</h2>
              <p className="mt-4 leading-8 text-ink-700 dark:text-ink-200">
                我是无线通信算法工程师，长期从事系统仿真、5G/6G技术预研、AI辅助研发、研发效能提升和技术团队管理相关工作。
              </p>
              <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">
                我希望把复杂工程问题讲清楚，把技术经验沉淀成可复用的方法，也把个人成长和团队管理中的真实判断长期记录下来。
              </p>
            </div>
            <div className="mx-auto w-full max-w-[240px]">
              <div className="rounded-md border border-ink-200 bg-ink-50 p-2 dark:border-ink-800 dark:bg-ink-900/60">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-ink-100 dark:bg-ink-900">
                  <Image
                    src="/images/xiang-fuxing-profile.jpg"
                    alt="向福星个人照片"
                    fill
                    sizes="(min-width: 768px) 240px, 70vw"
                    className="object-cover object-[50%_32%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="text-xl font-semibold text-ink-950 dark:text-white">我的关注方向</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => (
              <div key={area} className="rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200">
                {area}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="text-xl font-semibold text-ink-950 dark:text-white">我的能力标签</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="text-xl font-semibold text-ink-950 dark:text-white">我的工作原则</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {principles.map((principle) => (
              <article key={principle.title} className="rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-900/60">
                <h3 className="font-semibold text-ink-950 dark:text-white">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="text-xl font-semibold text-ink-950 dark:text-white">我能提供什么价值</h2>
          <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">我希望和哪些人交流</p>
          <p className="mt-2 leading-8 text-ink-700 dark:text-ink-200">如果你也关注以下问题，欢迎交流：</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {valueTopics.map((topic, index) => (
              <div key={topic} className="flex gap-3 rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-900/60">
                <span className="mt-0.5 text-xs font-semibold text-signal-700 dark:text-signal-300">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-sm leading-7 text-ink-700 dark:text-ink-200">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="text-xl font-semibold text-ink-950 dark:text-white">联系我</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ContactLink href={`mailto:${siteConfig.email}`} icon={<Mail className="h-4 w-4" />} label="Email" value={siteConfig.email} />
            <ContactLink href={siteConfig.github} icon={<Github className="h-4 w-4" />} label="GitHub" value={siteConfig.githubName} external />
            <ContactLink href={siteConfig.zhihu} icon={<MessageCircle className="h-4 w-4" />} label="知乎" value={siteConfig.zhihuName} external />
            <ContactLink href={siteConfig.xiaohongshu} icon={<NotebookText className="h-4 w-4" />} label="小红书" value={siteConfig.xiaohongshuName} external />
            <ContactLink href={siteConfig.douyin} icon={<Video className="h-4 w-4" />} label="抖音" value={siteConfig.douyinName} external />
            <span className="contact-link">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>
                <span className="block">微信</span>
                <span className="block text-xs text-ink-500 dark:text-ink-400">{siteConfig.wechat}</span>
              </span>
            </span>
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
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="contact-link">
      <span className="shrink-0">{icon}</span>
      <span>
        <span className="block">{label}</span>
        <span className="block break-all text-xs text-ink-500 dark:text-ink-400">{value}</span>
      </span>
    </a>
  );
}
