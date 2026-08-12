import type { ReactNode } from "react";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "editorial";
  as?: "h1" | "h2";
};

export function SectionTitle({ eyebrow, title, description, action, variant = "default", as: Heading = "h2" }: SectionTitleProps) {
  if (variant === "default") {
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
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-secondary sm:text-base sm:leading-8">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  }

  return (
    <div className="mb-10 border-t border-border pt-5 sm:mb-14 sm:pt-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.62fr)] lg:items-end lg:gap-12">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-4 max-w-xl text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <Heading className="max-w-5xl font-display text-[clamp(2.25rem,5.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-primary">
            {title}
          </Heading>
        </div>

        {description || action ? (
          <div className="min-w-0 border-l border-border pl-5 sm:pl-6">
            {description ? (
              <p className="max-w-2xl text-[15px] leading-7 text-secondary">
                {description}
              </p>
            ) : null}
            {action ? <div className={description ? "mt-5" : undefined}>{action}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
