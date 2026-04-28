import { ArrowRight, BrainCircuit, CheckCircle2, Compass, GitBranch, Layers, Network, Scale, Target } from "lucide-react";
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

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Methodology"
        title="我的方法论"
        description="方法论不是口号，而是复杂工作中的稳定抓手。它帮助我在技术探索、工程交付和团队协同之间保持一致。"
      />

      <section className="grid gap-4 md:grid-cols-4">
        {fourSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="relative rounded-md border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-signal-50 text-signal-700 dark:bg-signal-950 dark:text-signal-300">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-ink-400">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">{step.description}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
        <div className="flex flex-col gap-4 border-b border-ink-200 pb-5 dark:border-ink-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">Cognitive Frame</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-ink-950 dark:text-white">认知框架</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-ink-600 dark:text-ink-300">
            做事方法决定执行质量，认知框架决定选择质量。面对复杂问题时，我更关注三件事：选择什么、怎么看清、如何做成。
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.25fr_1fr]">
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
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <MethodCard title="技术学习方法" items={learning} />
        <MethodCard title="管理实践方法" items={management} />
      </section>

      <section className="mt-8 rounded-md border border-ink-200 bg-ink-950 p-6 text-white dark:border-ink-800">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-signal-300">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI辅助研发方法</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {aiMethods.map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-ink-200">
                  {item}
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
    <article className="rounded-md border border-ink-200 bg-ink-50 p-5 dark:border-ink-800 dark:bg-ink-900/60">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-signal-700 shadow-sm ring-1 ring-ink-200 dark:bg-ink-950 dark:text-signal-300 dark:ring-ink-800">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{description}</p>
      <h3 className="mt-1 text-xl font-semibold text-ink-950 dark:text-white">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div key={item.title} className="rounded-md border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xs font-semibold text-signal-700 dark:text-signal-300">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm leading-6 text-ink-600 dark:text-ink-300">{item.description}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {footnote ? (
        <div className="mt-4 rounded-md border border-signal-200 bg-signal-50 px-4 py-3 text-sm font-medium text-signal-800 dark:border-signal-900/70 dark:bg-signal-950/40 dark:text-signal-200">
          {footnote}
        </div>
      ) : null}
    </article>
  );
}

function MethodCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-md border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
      <h2 className="text-xl font-semibold text-ink-950 dark:text-white">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div key={item} className="flex gap-3 rounded-md border border-ink-200 bg-ink-50 p-4 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200">
            <span className="text-xs font-semibold text-signal-700 dark:text-signal-300">{String(index + 1).padStart(2, "0")}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
