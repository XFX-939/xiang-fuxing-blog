import type { ReactNode } from "react";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionTitle({ eyebrow, title, description, action }: SectionTitleProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold leading-tight tracking-normal text-ink-950 sm:text-3xl dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-600 dark:text-ink-300 sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
