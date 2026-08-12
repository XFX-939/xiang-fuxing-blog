import { ProjectCard } from "@/components/ProjectCard";
import { SectionTitle } from "@/components/SectionTitle";
import { githubProjectSnapshot, projectGroups } from "@/lib/projects";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "GitHub 项目",
  description: "向福星 GitHub 公开仓库项目展示，覆盖 AI 工具、数据看板、前端交互、量化研究、工程效率和编程学习。",
  path: "/projects"
});

export default function ProjectsPage() {
  const { lead, spotlight, current, archive } = projectGroups;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <SectionTitle
          as="h1"
          variant="editorial"
          eyebrow={`GitHub / ${githubProjectSnapshot.account} / 更新于 ${githubProjectSnapshot.syncedAt}`}
          title="公开项目，按意图而不是热度编排"
          description={`GitHub 当前共 ${githubProjectSnapshot.publicRepositoryCount} 个公开仓库，其中 ${githubProjectSnapshot.curatedProjectCount} 个纳入这份工程刊物。首屏仅保留当前主线，早期项目收入可展开的档案。`}
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
          <ProjectCard project={lead} index={0} variant="feature" />
        </section>

        <section className="mt-24 sm:mt-32" aria-labelledby="spotlight-projects-title">
          <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Signals in motion</p>
              <h2 id="spotlight-projects-title" className="mt-3 max-w-sm font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">
                正在发生的工程现场
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-secondary">
                三条近期主线：设备侧安全发布、可回滚网络运维，以及可交互的 AI 学习实验。
              </p>
            </div>
            <div className="relative grid gap-8 pb-8">
              {spotlight.map((project, projectIndex) => (
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
              只保留六个能代表当前方向的项目，完整的历史路径收入下方档案。
            </p>
          </div>
          <div className="mt-8 grid gap-x-12 md:grid-cols-2">
            {current.map((project, projectIndex) => (
              <ProjectCard key={project.name} project={project} index={projectIndex + 4} variant="note" />
            ))}
          </div>
        </section>

        <section className="mt-24 sm:mt-36" aria-labelledby="archive-projects-title">
          <details className="group border-y border-border">
            <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-8 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Learning archive</p>
                <h2 id="archive-projects-title" className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-primary sm:text-4xl">
                  早期路径 · {archive.length} 个项目
                </h2>
              </div>
              <span className="shrink-0 text-sm font-semibold text-secondary group-open:hidden">展开档案 ↓</span>
              <span className="hidden shrink-0 text-sm font-semibold text-secondary group-open:inline">收起档案 ↑</span>
            </summary>
            <p className="max-w-3xl pb-7 text-[15px] leading-7 text-secondary">
              这些仓库保留了早期学习、Fork 实践和产品实验的真实轨迹。默认收起，需要时再展开查看。
            </p>
            <div className="border-b border-border">
              {archive.map((project, projectIndex) => (
                <ProjectCard key={project.name} project={project} index={projectIndex + 10} variant="archive" />
              ))}
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
