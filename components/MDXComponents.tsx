import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXComponents = {
  h2: ({ className, ...props }) => (
    <h2
      className={cn("scroll-mt-24 border-b border-border pb-2 text-2xl font-semibold tracking-normal text-primary", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("scroll-mt-24 text-xl font-semibold tracking-normal text-primary", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("leading-8 text-secondary", className)} {...props} />
  ),
  a: ({ className, href, ...props }) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href);

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className={cn("font-medium text-accent underline underline-offset-4 hover:opacity-80", className)}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-l-4 border-accent bg-accent-soft px-5 py-3 text-secondary", className)}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-md border border-border">
      <table className={cn("min-w-full divide-y divide-border text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th className={cn("bg-surface-elevated px-4 py-3 text-left font-semibold text-primary", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("px-4 py-3 text-secondary", className)} {...props} />
  ),
  img: ({ className, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md border border-border shadow-sm dark:shadow-soft-dark", className)} alt={alt ?? ""} loading="lazy" {...props} />
  )
};
