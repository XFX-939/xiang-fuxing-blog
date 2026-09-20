import { ArrowUpRight, CalendarDays, GitFork, Star } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/classic/ProjectCard";
import { SectionTitle } from "@/components/classic/SectionTitle";
import { projects, type Project } from "@/lib/projects";
import { createMetadata, formatDate } from "@/lib/utils";

export const metadata = createMetadata({
  title: "GitHub 项目",
  description: "向福星 GitHub 公开仓库项目展示，覆盖 AI 工具、数据看板、前端交互、量化研究、工程效率和编程学习。",
  path: "/projects"
});

export default function ProjectsPage() {
  const featuredProjects = projects
    .filter((project) => !project.isFork && project.status !== "历史项目" && project.status !== "学习沉淀")
    .slice(0, 6);
  const featuredNames = new Set(featuredProjects.map((project) => project.name));
  const currentProjects = projects.filter((project) => !featuredNames.has(project.name) && !project.isFork && !["历史项目", "学习沉淀"].includes(project.status));
  const forkProjects = projects.filter((project) => !featuredNames.has(project.name) && project.isFork);
  const archiveProjects = projects.filter((project) => !featuredNames.has(project.name) && !project.isFork && ["历史项目", "学习沉淀"].includes(project.status));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        as="h1"
        eyebrow="Projects"
        title="GitHub 公开项目"
        description={`整理自 GitHub 公开仓库，共 ${projects.length} 个项目。先看当前正在形成的核心项目，再展开近期记录、Fork 实践和历史档案。`}
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>

      <div className="mt-8 grid gap-4">
        <ProjectArchiveGroup title="近期项目与方向探索" projects={currentProjects} />
        <ProjectArchiveGroup title="Fork 实践" projects={forkProjects} />
        <ProjectArchiveGroup title="历史学习档案" projects={archiveProjects} />
      </div>
    </div>
  );
}

function ProjectArchiveGroup({ title, projects: groupedProjects }: { title: string; projects: Project[] }) {
  if (groupedProjects.length === 0) {
    return null;
  }

  return (
    <details className="group rounded-md border border-border bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
        <span>{title}</span>
        <span className="text-sm font-normal text-muted">{groupedProjects.length} 个项目</span>
      </summary>
      <div className="divide-y divide-border border-t border-border">
        {groupedProjects.map((project) => (
          <ProjectArchiveRow key={project.name} project={project} />
        ))}
      </div>
    </details>
  );
}

function ProjectArchiveRow({ project }: { project: Project }) {
  return (
    <article className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="truncate text-base font-semibold text-primary">{project.name}</h3>
          <span className="rounded-md border border-border bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
            {project.status}
          </span>
          {project.isFork ? <span className="text-xs font-medium text-accent">Fork</span> : null}
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-secondary">{project.direction}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {project.updatedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              更新于 {formatDate(project.updatedAt)}
            </span>
          ) : null}
          {typeof project.stars === "number" ? (
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              <span aria-hidden="true">{project.stars}</span>
              <span className="sr-only">{project.stars} 个 Star</span>
            </span>
          ) : null}
          {typeof project.forks === "number" ? (
            <span className="inline-flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
              <span aria-hidden="true">{project.forks}</span>
              <span className="sr-only">{project.forks} 个 Fork</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {project.links.map((link) => {
          const isExternal = link.href.startsWith("http");
          const className =
            "inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-accent transition hover:border-accent hover:bg-accent-soft";

          return isExternal ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={className}>
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <Link key={link.href} href={link.href} className={className}>
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </article>
  );
}
