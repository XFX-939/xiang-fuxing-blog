import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, GitFork, Star } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TagList } from "@/components/TagList";
import { formatDate } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-border bg-surface p-5 shadow-sm sm:rounded-md dark:shadow-soft-dark">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {project.direction}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-primary">{project.name}</h3>
        </div>
        <span className="rounded-md border border-border bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {project.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        {project.updatedAt ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            更新于 {formatDate(project.updatedAt)}
          </span>
        ) : null}
        {typeof project.stars === "number" ? (
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {project.stars}
          </span>
        ) : null}
        {typeof project.forks === "number" ? (
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5" />
            {project.forks}
          </span>
        ) : null}
        {project.isFork ? <span className="text-accent">Fork</span> : null}
      </div>

      <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-secondary sm:text-sm">{project.description}</p>
      <div className="mt-5 grid gap-3">
        {project.outcomes.slice(0, 3).map((outcome) => (
          <div key={outcome} className="flex gap-2 text-sm leading-6 text-secondary">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
            <span>{outcome}</span>
          </div>
        ))}
      </div>
      <TagList className="mt-5" tags={project.technologies} maxVisible={project.technologies.length} showMore={false} compact />
      <div className="mt-5 flex flex-wrap gap-3">
        {project.links.map((link) => {
          const isExternal = link.href.startsWith("http");
          const className = "inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-md border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent-soft sm:min-h-0 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:font-medium";

          return isExternal ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={className}>
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link key={link.href} href={link.href} className={className}>
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          );
        })}
      </div>
    </article>
  );
}
