import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Tag } from "@/components/Tag";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-md border border-ink-200 bg-white p-5 shadow-sm dark:border-ink-800 dark:bg-ink-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-700 dark:text-signal-300">
            {project.direction}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink-950 dark:text-white">{project.name}</h3>
        </div>
        <span className="rounded-md border border-signal-200 bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-800 dark:border-signal-800 dark:bg-signal-950/60 dark:text-signal-200">
          {project.status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">{project.description}</p>
      <div className="mt-5 grid gap-3">
        {project.outcomes.map((outcome) => (
          <div key={outcome} className="flex gap-2 text-sm leading-6 text-ink-700 dark:text-ink-200">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-signal-600 dark:text-signal-300" />
            <span>{outcome}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <Tag key={technology}>{technology}</Tag>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {project.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-signal-700 transition hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100"
          >
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </article>
  );
}
