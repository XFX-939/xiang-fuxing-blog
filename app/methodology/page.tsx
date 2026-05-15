import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BrainCircuit, CheckCircle2, Compass, GitBranch, Layers, Target } from "lucide-react";
import { MethodologyNavigation, type MethodologyTocItem } from "@/components/MethodologyNavigation";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "我的方法论",
  description: "目标、方法、执行、复盘，以及选择原则、系统性思维、资源整合、管理实践和 AI辅助研发方法。",
  path: "/methodology"
});

const fourSteps = [
  { title: "有目标", description: "明确方向、指标和结果", icon: Target },
  { title: "有方法", description: "拆解路径、抓住关键杠杆", icon: GitBranch },
  { title: "有执行", description: "形成节奏、推进闭环", icon: ArrowRight },
  { title: "有复盘", description: "总结经验、沉淀方法、持续进化", icon: CheckCircle2 }
];

const learning = ["先建立全局框架", "再拆解核心概念", "再结合代码和案例理解", "最后形成自己的表达和沉淀"];
const management = ["目标对齐", "责任明确", "过程可视", "风险前置", "激励及时", "复盘闭环"];
const aiMethods = [
  "人负责判断，AI负责加速",
  "不迷信 AI 生成结果",
  "重点使用 AI 做代码阅读、方案草拟、问题定位、文档总结",
  "建立可复用 Prompt、知识库和工具链"
];

const choicePrinciples = [
  "坚持做正确且有挑战的事",
  "坚持独立思考和判断",
  "保持好奇心和求知欲",
  "保持乐观和韧性"
];

const systemsThinking = [
  { title: "定义边界", description: "解决什么，不解决什么" },
  { title: "拆系统结构", description: "目标、规则、资源、流程、结果" },
  { title: "抓关键变量", description: "找到真正影响结果的 80/20 杠杆点" },
  { title: "看动态关系", description: "识别因果链、反馈回路和连锁影响" },
  { title: "做权衡", description: "看清 trade-off，选择能落地的方案" }
];

const resourceIntegration = [
  { title: "信息整合", description: "区分事实与立场，先统一问题底图" },
  { title: "人的整合", description: "识别决策者、专家、推进者和执行者" },
  { title: "资源整合", description: "匹配时间、预算、工具和必要背书" },
  { title: "节奏整合", description: "在合适的时间点使用合适的资源" }
];

const importantCognitions = [
  {
    title: "谋定而后动",
    description: "先想清楚目标、边界、关键变量、资源条件和主要风险，再进入执行。不是为了拖慢节奏，而是减少无效返工，让行动更有命中率。",
    icon: Target
  },
  {
    title: "能成事、积极正向、会关注人",
    description: "判断一个人或团队的长期价值，不能只看技术深度和聪明程度，还要看能不能把事情闭环、能不能提供正向能量、能不能理解和激发身边的人。",
    icon: CheckCircle2
  }
];

const tocItems: MethodologyTocItem[] = [
  { id: "core-habits", label: "核心习惯" },
  { id: "cognitive-frame", label: "认知框架" },
  { id: "choice-principles", label: "做选择的原则" },
  { id: "systems-thinking", label: "系统性思维" },
  { id: "resource-integration", label: "资源整合能力" },
  { id: "technical-learning", label: "技术学习方法" },
  { id: "management-practice", label: "管理实践方法" },
  { id: "ai-rd-method", label: "AI辅助研发方法" }
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
      <section
        id="core-habits"
        className="scroll-mt-36 rounded-[22px] border border-border bg-surface-elevated px-5 py-8 sm:rounded-md sm:px-8 sm:py-10 lg:px-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Methodology</p>
        <h1 className="mt-3 max-w-4xl text-[34px] font-semibold leading-tight tracking-normal text-primary sm:text-5xl">
          我的方法论
        </h1>
        <p className="mt-5 max-w-3xl text-[15px] leading-8 text-secondary sm:text-base">
          方法论不是口号，而是复杂工作中的稳定抓手。它帮助我在技术探索、工程交付和团队协同之间保持一致。
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-4">
          {fourSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="group flex h-full flex-col rounded-[18px] border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft sm:rounded-md dark:hover:shadow-soft-dark"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-3xl font-semibold leading-none text-accent/30">0{index + 1}</span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-primary">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-secondary">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <MethodologyNavigation items={tocItems} />

        <article className="min-w-0 space-y-8">
          <SectionCard
            id="cognitive-frame"
            eyebrow="Cognitive Frame"
            title="认知框架"
            description="做事方法决定执行质量，认知框架决定选择质量。面对复杂问题时，我更关注三件事：选择什么、怎么看清、如何做成。"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {importantCognitions.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-md border border-border bg-surface-elevated p-5">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent shadow-sm ring-1 ring-border">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-muted">两个重要认知</p>
                    <h3 className="mt-1 text-xl font-semibold text-primary">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-secondary">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard id="choice-principles" eyebrow="Choice" title="两个坚持，两个保持" description="做选择的原则">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {choicePrinciples.map((item) => (
                <ListTile key={item}>{item}</ListTile>
              ))}
            </div>
          </SectionCard>

          <SectionCard id="systems-thinking" eyebrow="System" title="系统性思维" description="看问题的方式">
            <ProcessList items={systemsThinking} />
            <div className="mt-5 rounded-md border border-border bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
              核心：看全局、抓关键、做取舍
            </div>
          </SectionCard>

          <SectionCard id="resource-integration" eyebrow="Integration" title="资源整合能力" description="把事做成的能力">
            <StructuredGrid items={resourceIntegration} />
          </SectionCard>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ApplicationCard id="technical-learning" icon={Layers} title="技术学习方法" items={learning} />
            <ApplicationCard id="management-practice" icon={Compass} title="管理实践方法" items={management} />
            <ApplicationCard id="ai-rd-method" icon={BrainCircuit} title="AI辅助研发方法" items={aiMethods} />
          </section>
        </article>
      </div>
    </div>
  );
}

function SectionCard({
  id,
  eyebrow,
  title,
  description,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-36 rounded-[22px] border border-border bg-surface p-5 sm:rounded-md sm:p-8">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-primary">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary">{description}</p> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProcessList({ items }: { items: Array<{ title: string; description: string }> }) {
  return (
    <ol className="relative grid gap-4 before:absolute before:left-4 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-border">
      {items.map((item, index) => (
        <li key={item.title} className="relative pl-12">
          <span className="absolute left-0 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-surface text-xs font-semibold text-accent shadow-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="rounded-md border border-border bg-surface-elevated p-4 transition hover:border-accent/60">
            <h3 className="text-base font-semibold text-primary">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-secondary">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StructuredGrid({ items }: { items: Array<{ title: string; description: string }> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.title} className="rounded-md border border-border bg-surface-elevated p-4">
          <div className="flex items-start gap-3">
            <CheckBullet className="mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold leading-6 text-primary">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-secondary">{item.description}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplicationCard({ id, icon: Icon, title, items }: { id: string; icon: LucideIcon; title: string; items: string[] }) {
  return (
    <section id={id} className="scroll-mt-36 rounded-[22px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <ListTile key={item}>{item}</ListTile>
        ))}
      </div>
    </section>
  );
}

function ListTile({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated p-4 text-sm leading-7 text-secondary">
      <CheckBullet className="mt-1" />
      <span>{children}</span>
    </div>
  );
}

function CheckBullet({ className = "" }: { className?: string }) {
  return <CheckCircle2 className={`h-4 w-4 shrink-0 text-accent ${className}`} />;
}
