import type { ReactNode } from "react";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
};

export function SectionTitle({ eyebrow, title, description, action, as: Heading = "h2" }: SectionTitleProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="text-2xl font-semibold leading-tight tracking-normal text-primary sm:text-3xl">
          {title}
        </Heading>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-secondary sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
