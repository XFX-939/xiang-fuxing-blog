"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CalendarDays, GitFork, Star } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn, formatDate } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type ProjectCardVariant = "feature" | "spotlight" | "note" | "archive";

type ProjectCardProps = {
  project: Project;
  index?: number;
  variant?: ProjectCardVariant;
  stackIndex?: number;
};

export function ProjectCard({
  project,
  index = 0,
  variant = "note",
  stackIndex = 0
}: ProjectCardProps) {
  const articleRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const article = articleRef.current;

      if (
        !article ||
        window.matchMedia("(max-width: 767px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.fromTo(
        article,
        {
          autoAlpha: 0,
          y: variant === "feature" ? 36 : 22,
          scale: variant === "spotlight" ? 0.975 : 1
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 91%",
            once: true
          }
        }
      );
    },
    { scope: articleRef, dependencies: [variant] }
  );

  if (variant === "feature") {
    return (
      <article ref={articleRef} className="group relative border-y border-border bg-surface py-8 sm:py-11">
        <span className="absolute left-0 top-0 h-px w-20 bg-accent transition-[width] duration-700 ease-out group-hover:w-40" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.58fr)] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="text-accent">Lead signal</span>
              <span>{project.status}</span>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-primary transition-colors duration-300 group-hover:text-accent">
              {project.name}
            </h3>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-secondary sm:text-xl sm:leading-9">
              {project.description}
            </p>
            <ProjectMeta project={project} className="mt-7" />
          </div>

          <div className="border-l border-border pl-5 sm:pl-7">
            <p className="text-sm font-semibold leading-6 text-primary">{project.direction}</p>
            <OutcomeList outcomes={project.outcomes} className="mt-5" />
            <TechnologyLine technologies={project.technologies} className="mt-7" />
            <ProjectLinks links={project.links} className="mt-7" />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "spotlight") {
    return (
      <article
        ref={articleRef}
        className="group border border-border bg-surface px-5 py-7 sm:px-8 sm:py-9 lg:sticky lg:px-10"
        style={{ top: `${104 + stackIndex * 18}px` }}
      >
        <span className="absolute inset-y-0 left-0 w-px bg-accent transition-[width] duration-500 group-hover:w-1" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(20rem,0.58fr)]">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{project.status}</span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-accent">{project.direction}</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-primary transition-colors duration-300 group-hover:text-accent sm:text-5xl">
              {project.name}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-secondary">{project.description}</p>
            <ProjectMeta project={project} className="mt-6" />
          </div>

          <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <OutcomeList outcomes={project.outcomes} />
            <TechnologyLine technologies={project.technologies} className="mt-6" />
            <ProjectLinks links={project.links} className="mt-6" />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "archive") {
    return (
      <article
        ref={articleRef}
        className="group grid gap-5 border-t border-border py-6 transition-[grid-template-columns,background-color,padding] duration-500 hover:bg-surface-elevated hover:px-3 lg:grid-cols-[minmax(12rem,0.62fr)_minmax(0,1.38fr)_minmax(13rem,0.72fr)] lg:gap-8 lg:hover:grid-cols-[minmax(14rem,0.76fr)_minmax(0,1.24fr)_minmax(13rem,0.72fr)]"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{project.status}</span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-primary transition-colors duration-300 group-hover:text-accent">
            {project.name}
          </h3>
          <p className="mt-2 text-xs font-semibold leading-5 text-accent">{project.direction}</p>
          <ProjectMeta project={project} className="mt-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-7 text-secondary">{project.description}</p>
          <OutcomeList outcomes={project.outcomes} className="mt-4" compact />
        </div>

        <div className="min-w-0 lg:border-l lg:border-border lg:pl-6">
          <TechnologyLine technologies={project.technologies} />
          <ProjectLinks links={project.links} className="mt-5" />
        </div>
      </article>
    );
  }

  return (
    <article ref={articleRef} className="group relative border-t border-border py-7 sm:py-9">
      <span className="absolute left-0 top-0 h-px w-10 bg-accent transition-[width] duration-500 group-hover:w-24" />
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{project.direction}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-primary transition-colors duration-300 group-hover:text-accent sm:text-3xl">
            {project.name}
          </h3>
        </div>
        <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <p className="mt-5 text-[15px] leading-7 text-secondary">{project.description}</p>
      <ProjectMeta project={project} className="mt-5" />
      <OutcomeList outcomes={project.outcomes} className="mt-5" compact />
      <TechnologyLine technologies={project.technologies} className="mt-6" />
      <ProjectLinks links={project.links} className="mt-6" />
    </article>
  );
}

function ProjectMeta({ project, className }: { project: Project; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted", className)}>
      {project.updatedAt ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          更新于 {formatDate(project.updatedAt)}
        </span>
      ) : null}
      {typeof project.stars === "number" ? (
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          {project.stars}
        </span>
      ) : null}
      {typeof project.forks === "number" ? (
        <span className="inline-flex items-center gap-1.5">
          <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
          {project.forks}
        </span>
      ) : null}
      {project.isFork ? <span className="font-semibold text-accent">Fork</span> : null}
    </div>
  );
}

function OutcomeList({
  outcomes,
  className,
  compact = false
}: {
  outcomes: string[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <ol className={cn("grid", compact ? "gap-2" : "gap-3", className)}>
      {outcomes.map((outcome, outcomeIndex) => (
        <li key={outcome} className="grid grid-cols-[1.6rem_minmax(0,1fr)] gap-2 text-sm leading-6 text-secondary">
          <span className="font-mono text-[10px] font-semibold text-accent">
            {String(outcomeIndex + 1).padStart(2, "0")}
          </span>
          <span>{outcome}</span>
        </li>
      ))}
    </ol>
  );
}

function TechnologyLine({ technologies, className }: { technologies: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium leading-6 text-muted", className)}>
      {technologies.map((technology, technologyIndex) => (
        <span key={technology} className="inline-flex items-center gap-2">
          {technologyIndex > 0 ? <span className="text-accent/60">/</span> : null}
          {technology}
        </span>
      ))}
    </div>
  );
}

function ProjectLinks({ links, className }: { links: Project["links"]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      {links.map((link) => {
        const isExternal = link.href.startsWith("http");
        const linkClassName =
          "group/link inline-flex min-h-11 items-center gap-2 border-b border-accent/40 py-2 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface sm:min-h-0 sm:py-1";
        const content = (
          <>
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true" />
          </>
        );

        return isExternal ? (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={linkClassName}>
            {content}
          </a>
        ) : (
          <Link key={link.href} href={link.href} className={linkClassName}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
