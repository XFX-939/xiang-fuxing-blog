import { ProjectCard } from "@/components/ProjectCard";
import { SectionTitle } from "@/components/SectionTitle";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "GitHub 项目",
  description: "向福星 GitHub 公开仓库项目展示，覆盖 AI 工具、数据看板、前端交互、量化研究、工程效率和编程学习。",
  path: "/projects"
});

const leadProject = projects[0];
const spotlightProjects = projects.slice(1, 4);
const currentProjects = projects.slice(4, 13);
const archiveProjects = projects.slice(13);

export default function ProjectsPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <SectionTitle
          as="h1"
          variant="editorial"
          eyebrow="Public engineering ledger / 2020—2026"
          title="公开项目，按时间与意图重新编排"
          description={`共 ${projects.length} 个 GitHub 公开仓库。这里不是等权的卡片墙，而是一份持续更新的工程刊物：从当前试验场，到早期学习轨迹。`}
        />

        <div className="mb-16 grid gap-6 border-y border-border py-5 text-sm leading-6 text-secondary sm:grid-cols-3 lg:mb-24">
          <p>
            <span className="mr-3 font-mono text-xs text-accent">01</span>
            交互与仿真原型
          </p>
          <p>
            <span className="mr-3 font-mono text-xs text-accent">02</span>
            数据、AI 与个人工具
          </p>
          <p>
            <span className="mr-3 font-mono text-xs text-accent">03</span>
            编程学习与工程档案
          </p>
        </div>

        <section aria-labelledby="lead-project-title">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Current lead</p>
              <h2 id="lead-project-title" className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-primary sm:text-3xl">
                当前主项目
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-muted sm:block">
              以最近更新时间为线索，突出当前正在发生的实验。
            </p>
          </div>
          <ProjectCard project={leadProject} index={0} variant="feature" />
        </section>

        <section className="mt-24 sm:mt-32" aria-labelledby="spotlight-projects-title">
          <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Signals in motion</p>
              <h2 id="spotlight-projects-title" className="mt-3 max-w-sm font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">
                正在发生的工程现场
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-secondary">
                三条互相叠加的信号：3D 交互、复杂信息可视化，以及 AI 辅助内容生产。
              </p>
            </div>
            <div className="relative grid gap-8 pb-8">
              {spotlightProjects.map((project, projectIndex) => (
                <ProjectCard
                  key={project.name}
                  project={project}
                  index={projectIndex + 1}
                  variant="spotlight"
                  stackIndex={projectIndex}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 sm:mt-36" aria-labelledby="recent-projects-title">
          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Recent field notes</p>
              <h2 id="recent-projects-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">
                近期工程笔记
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-secondary">
              从小型游戏、金融研究终端到本地文件工具，每一条都保留目标、技术路径与公开链接。
            </p>
          </div>
          <div className="mt-8 grid gap-x-12 md:grid-cols-2">
            {currentProjects.map((project, projectIndex) => (
              <ProjectCard key={project.name} project={project} index={projectIndex + 4} variant="note" />
            ))}
          </div>
        </section>

        <section className="mt-24 sm:mt-36" aria-labelledby="archive-projects-title">
          <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Learning archive</p>
              <h2 id="archive-projects-title" className="mt-3 max-w-sm font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">
                早期路径，不删除的坐标
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-secondary lg:pt-1">
              历史项目是学习过程的真实截面。以索引式版面保留完整描述、产出、技术标签与原始仓库。
            </p>
          </div>
          <div className="mt-8 border-b border-border">
            {archiveProjects.map((project, projectIndex) => (
              <ProjectCard key={project.name} project={project} index={projectIndex + 13} variant="archive" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
