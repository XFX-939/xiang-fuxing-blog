import Link from "next/link";
import { ArrowRight, CheckCircle2, Github, Mail, MessageCircle, NotebookText, ShieldCheck, Video } from "lucide-react";
import { SectionTitle } from "@/components/classic/SectionTitle";
import { siteConfig } from "@/lib/site";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "合作与交流",
  description: "向福星个人博客合作与交流入口，面向非商业技术讨论、公开资料交流和长期知识沉淀。",
  path: "/collaboration"
});

const collaborationEmailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent("合作与交流｜来自个人博客")}`;

const cooperationTypes = [
  {
    title: "公开内容讨论",
    description: "围绕公开文章、技术观点和学习笔记做非商业讨论、引用和勘误，不做付费推广或广告植入。",
    points: ["基于公开内容", "注明来源和作者", "不做商业导流"]
  },
  {
    title: "技术交流",
    description: "围绕无线通信、系统仿真、AI Coding、研发效率、知识管理和技术管理做邮件交流或公开问题讨论。",
    points: ["问题具体清楚", "优先公开技术问题", "不涉及内部资料"]
  },
  {
    title: "开源项目交流",
    description: "围绕开源工具、AI 工作流、数据看板、个人网站、知识库和自动化脚本做经验互换。",
    points: ["公开仓库优先", "重视实际落地", "保留复盘和文档"]
  },
  {
    title: "资料线索互通",
    description: "围绕公开论文、技术资料、工具链、学习路径和工程实践线索做非商业信息互通。",
    points: ["公开资料优先", "价值匹配优先", "长期沉淀优先"]
  }
];

const suitableTopics = [
  "无线通信、5G/6G、系统仿真、数字孪生相关内容",
  "AI Coding、CodeAgent、AI 辅助研发和工程效率实践",
  "技术管理、团队协作、个人成长和知识管理复盘",
  "开发者工具、数据看板、个人效率产品和独立项目",
  "技术博客、知识社群、读书分享和长期主义内容"
];

const principles = [
  "公开：只讨论公开资料、公开问题和可公开表达的经验",
  "克制：不把博客做成广告位、导流页或商业入口",
  "独立：内容判断保持独立，不做任何组织或产品背书",
  "边界：不讨论未公开信息、内部资料或保密内容"
];

const nonCommercialStatements = [
  "本站是个人学习、技术笔记与公开资料整理空间，仅用于非盈利知识沉淀和非商业技术交流。",
  "本站不承接付费咨询、商业合作、广告赞助、课程销售、项目外包、内容推广、投资建议、社群运营或任何形式的盈利性服务。",
  "站内内容仅代表个人学习与公开思考，不代表任何组织或雇主立场；不包含未公开信息、内部资料或保密内容。"
];

const contactCards = [
  {
    label: "Email",
    value: siteConfig.email,
    href: collaborationEmailHref,
    icon: Mail
  },
  {
    label: "GitHub",
    value: siteConfig.githubName,
    href: siteConfig.github,
    icon: Github,
    external: true
  },
  {
    label: "知乎",
    value: siteConfig.zhihuName,
    href: siteConfig.zhihu,
    icon: MessageCircle,
    external: true
  },
  {
    label: "小红书",
    value: siteConfig.xiaohongshuName,
    href: siteConfig.xiaohongshu,
    icon: NotebookText,
    external: true
  },
  {
    label: "抖音",
    value: siteConfig.douyinName,
    href: siteConfig.douyin,
    icon: Video,
    external: true
  }
];

export default function CollaborationPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        eyebrow="Collaboration"
        title="合作与交流"
        description="这个页面用于承接非商业技术讨论、公开资料交流和长期知识沉淀。交流不追求热闹，优先看问题质量、公开边界和长期价值。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="grid gap-6">
          <section className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Why</p>
            <h2 className="mt-3 text-2xl font-semibold text-primary">我希望建立怎样的交流关系</h2>
            <p className="mt-4 text-[15px] leading-8 text-secondary">
              我希望这个博客不只是个人输出，也能逐步成为一个可信的公开讨论入口：让关注复杂工程、AI 辅助研发、技术管理和个人知识系统的人围绕具体问题交流。
            </p>
            <p className="mt-3 text-[15px] leading-8 text-secondary">
              如果你对这些方向有公开技术问题、资料线索或实践复盘，可以通过邮件交流。所有讨论都以非商业、可公开、可沉淀为边界。
            </p>
          </section>

          <section className="rounded-[18px] border border-accent/30 bg-accent-soft p-5 sm:rounded-md sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Non-commercial Notice</p>
                <h2 className="mt-3 text-2xl font-semibold text-primary">非商业声明</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              {nonCommercialStatements.map((statement) => (
                <p key={statement} className="text-[15px] leading-8 text-secondary">
                  {statement}
                </p>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cooperationTypes.map((item) => (
              <article key={item.title} className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md">
                <h2 className="text-xl font-semibold text-primary">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-secondary">{item.description}</p>
                <div className="mt-5 grid gap-2">
                  {item.points.map((point) => (
                    <div key={point} className="flex gap-2 text-sm leading-6 text-secondary">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
            <h2 className="text-2xl font-semibold text-primary">适合交流的方向</h2>
            <div className="mt-5 grid gap-3">
              {suitableTopics.map((topic) => (
                <div key={topic} className="flex gap-3 rounded-md border border-border bg-surface-elevated p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm leading-7 text-secondary">{topic}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h2 className="text-2xl font-semibold text-primary">交流边界</h2>
                <p className="mt-3 text-sm leading-7 text-secondary">
                  我会保持内容判断独立，不做虚假背书，不推广灰色项目，不接和本站定位无关的硬广，也不承接任何形式的盈利性服务。
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="rounded-md border border-border bg-surface-elevated p-4 text-sm leading-7 text-secondary">
                  {principle}
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <section className="rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contact</p>
            <h2 className="mt-3 text-xl font-semibold text-primary">发起交流</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              建议先简单说明你的问题背景、公开资料来源、希望讨论的方向，以及哪些内容可以公开沉淀。
            </p>

            <Link
              href={collaborationEmailHref}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
            >
              邮件联系
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 grid gap-3">
              {contactCards.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target={contact.external ? "_blank" : undefined}
                    rel={contact.external ? "noreferrer" : undefined}
                    className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface-elevated p-3 text-sm text-secondary transition hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-semibold">{contact.label}</span>
                      <span className="block truncate text-xs text-muted">{contact.value}</span>
                    </span>
                  </a>
                );
              })}
              <div className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface-elevated p-3 text-sm text-secondary">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block font-semibold">微信</span>
                  <span className="block text-xs text-muted">{siteConfig.wechat}</span>
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
