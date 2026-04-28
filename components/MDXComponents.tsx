import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXComponents = {
  h2: ({ className, ...props }) => (
    <h2
      className={cn("scroll-mt-24 border-b border-ink-200 pb-2 text-2xl font-semibold tracking-normal text-ink-950 dark:border-ink-800 dark:text-white", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("scroll-mt-24 text-xl font-semibold tracking-normal text-ink-950 dark:text-white", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("leading-8 text-ink-700 dark:text-ink-200", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium text-signal-700 underline underline-offset-4 hover:text-signal-900 dark:text-signal-300 dark:hover:text-signal-100", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-l-4 border-signal-300 bg-signal-50/80 px-5 py-3 text-ink-700 dark:border-signal-700 dark:bg-signal-950/30 dark:text-ink-200", className)}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-md border border-ink-200 dark:border-ink-800">
      <table className={cn("min-w-full divide-y divide-ink-200 text-sm dark:divide-ink-800", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th className={cn("bg-ink-50 px-4 py-3 text-left font-semibold text-ink-900 dark:bg-ink-900 dark:text-white", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("px-4 py-3 text-ink-700 dark:text-ink-200", className)} {...props} />
  ),
  img: ({ className, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md border border-ink-200 dark:border-ink-800", className)} alt={alt ?? ""} loading="lazy" {...props} />
  )
};
