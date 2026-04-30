"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
  className
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("rounded-[18px] border border-border bg-surface p-5", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-6 text-primary">{title}</span>
          {description ? (
            <span className="mt-2 block text-sm leading-6 text-secondary">{description}</span>
          ) : null}
        </span>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted transition", open ? "rotate-180" : "rotate-0")} />
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
