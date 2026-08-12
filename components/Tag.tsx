import Link from "next/link";
import { cn } from "@/lib/utils";

type TagProps = {
  children: string;
  href?: string;
  count?: number;
  className?: string;
  size?: "default" | "index";
};

export function Tag({ children, href, count, className, size = "default" }: TagProps) {
  const content = (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 border border-border bg-tag-bg font-medium text-tag-text transition",
        size === "index" ? "min-h-10 px-3 py-2 text-[13px]" : "min-h-9 px-2.5 py-1.5 text-xs",
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

  return <Link href={href} className="inline-flex min-h-11 items-center">{content}</Link>;
}
