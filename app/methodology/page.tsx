import { ArrowRight, BrainCircuit, CheckCircle2, Compass, GitBranch, Layers, Network, Scale, Target } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { SectionTitle } from "@/components/SectionTitle";
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

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        eyebrow="Methodology"
        title="我的方法论"
        description="方法论不是口号，而是复杂工作中的稳定抓手。它帮助我在技术探索、工程交付和团队协同之间保持一致。"
      />

      <section className="grid grid-cols-2 gap-4 max-[379px]:grid-cols-1 md:grid-cols-4">
        {fourSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="relative rounded-[18px] border border-border bg-surface p-5 sm:rounded-md">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-muted">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-primary">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-secondary">{step.description}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-[18px] border border-border bg-surface p-5 sm:rounded-md sm:p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Cognitive Frame</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-primary">认知框架</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-secondary">
            做事方法决定执行质量，认知框架决定选择质量。面对复杂问题时，我更关注三件事：选择什么、怎么看清、如何做成。
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
          <CollapsibleSection title="两个坚持，两个保持" description="做选择的原则" className="bg-surface-elevated">
            <MobileList items={choicePrinciples} />
          </CollapsibleSection>
          <CollapsibleSection title="系统性思维" description="看问题的方式：看全局、抓关键、做取舍" className="bg-surface-elevated">
            <MobileStructuredList items={systemsThinking} />
          </CollapsibleSection>
          <CollapsibleSection title="资源整合能力" description="把事做成的能力" className="bg-surface-elevated">
            <MobileStructuredList items={resourceIntegration} />
          </CollapsibleSection>
        </div>

        <div className="mt-6 hidden gap-5 md:grid lg:grid-cols-[0.85fr_1.25fr_1fr]">
          <CognitionCard
            icon={Compass}
            title="两个坚持，两个保持"
            description="做选择的原则"
            items={choicePrinciples.map((item) => ({ title: item }))}
          />
          <CognitionCard
            icon={Layers}
            title="系统性思维"
            description="看问题的方式"
            items={systemsThinking}
            footnote="核心：看全局、抓关键、做取舍"
          />
          <CognitionCard
            icon={Network}
            title="资源整合能力"
            description="把事做成的能力"
            items={resourceIntegration}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {importantCognitions.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="rounded-[18px] border border-border bg-surface-elevated p-5 sm:rounded-md">
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
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:hidden">
        <CollapsibleSection title="技术学习方法" description="先建立全局，再拆概念、看代码、形成表达。">
          <MobileList items={learning} />
        </CollapsibleSection>
        <CollapsibleSection title="管理实践方法" description="围绕目标、责任、过程、风险、激励和复盘做闭环。">
          <MobileList items={management} />
        </CollapsibleSection>
        <CollapsibleSection title="AI辅助研发方法" description="人负责判断，AI负责加速。">
          <MobileList items={aiMethods} />
        </CollapsibleSection>
      </section>

      <section className="mt-8 hidden gap-5 md:grid lg:grid-cols-[1fr_1fr]">
        <MethodCard title="技术学习方法" items={learning} />
        <MethodCard title="管理实践方法" items={management} />
      </section>

      <section className="mt-8 hidden rounded-md border border-border bg-surface-elevated p-6 text-primary md:block">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI辅助研发方法</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {aiMethods.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-border bg-surface p-4 text-sm leading-7 text-secondary">
                  <CheckBullet className="mt-1 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CognitionCard({
  icon: Icon,
  title,
  description,
  items,
  footnote
}: {
  icon: typeof Scale;
  title: string;
  description: string;
  items: Array<{ title: string; description?: string }>;
  footnote?: string;
}) {
  return (
    <article className="rounded-md border border-border bg-surface-elevated p-5">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface text-accent shadow-sm ring-1 ring-border">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-muted">{description}</p>
      <h3 className="mt-1 text-xl font-semibold text-primary">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div key={item.title} className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <CheckBullet className="mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm leading-6 text-secondary">{item.description}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {footnote ? (
        <div className="mt-4 rounded-md border border-border bg-accent-soft px-4 py-3 text-sm font-medium text-accent dark:border-border dark:bg-accent-soft dark:text-accent">
          {footnote}
        </div>
      ) : null}
    </article>
  );
}

function MethodCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-md border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div key={item} className="flex gap-3 rounded-md border border-border bg-surface-elevated p-4 text-sm text-secondary">
            <CheckBullet />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function MobileList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={item} className="flex gap-3 rounded-md border border-border bg-surface p-3 text-sm leading-6 text-secondary">
          <CheckBullet className="mt-0.5" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function MobileStructuredList({ items }: { items: Array<{ title: string; description?: string }> }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={item.title} className="rounded-md border border-border bg-surface p-3">
          <div className="flex gap-3">
            <CheckBullet className="mt-0.5" />
            <div>
              <p className="text-sm font-semibold leading-6 text-primary">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm leading-6 text-secondary">{item.description}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckBullet({ className = "" }: { className?: string }) {
  return <CheckCircle2 className={`h-4 w-4 shrink-0 text-accent ${className}`} />;
}
