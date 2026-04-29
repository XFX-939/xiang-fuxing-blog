import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TagList } from "@/components/TagList";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-ink-200 bg-white p-5 shadow-sm sm:rounded-md dark:border-ink-800 dark:bg-ink-950">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-700 dark:text-signal-300">
            {project.direction}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink-950 dark:text-white">{project.name}</h3>
        </div>
        <span className="rounded-md border border-signal-200 bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-800 dark:border-signal-800 dark:bg-signal-950/60 dark:text-signal-200">
          {project.status}
        </span>
      </div>
      <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-ink-600 sm:text-sm dark:text-ink-300">{project.description}</p>
      <div className="mt-5 grid gap-3">
        {project.outcomes.slice(0, 3).map((outcome) => (
          <div key={outcome} className="flex gap-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-signal-600 dark:text-signal-300" />
            <span>{outcome}</span>
          </div>
        ))}
      </div>
      <TagList className="mt-5" tags={project.technologies} maxVisible={project.technologies.length} showMore={false} compact />
      <div className="mt-5 flex flex-wrap gap-3">
        {project.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-md border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm font-semibold text-signal-700 transition hover:border-signal-300 hover:text-signal-900 sm:min-h-0 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:font-medium dark:border-ink-800 dark:bg-ink-900/60 dark:text-signal-300 dark:hover:border-signal-700 dark:hover:text-signal-100 sm:dark:bg-transparent"
          >
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </article>
  );
}
