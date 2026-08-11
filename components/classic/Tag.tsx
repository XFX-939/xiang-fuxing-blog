import Link from "next/link";
import { cn } from "@/lib/utils";

type TagProps = {
  children: string;
  href?: string;
  count?: number;
  className?: string;
};

export function Tag({ children, href, count, className }: TagProps) {
  const content = (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-text transition",
        href && "hover:border-accent hover:text-accent hover:bg-accent-soft",
        className
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {typeof count === "number" ? <span className="text-muted">({count})</span> : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
