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
        "inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-600 transition dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300",
        href && "hover:border-signal-300 hover:text-signal-700 dark:hover:border-signal-700 dark:hover:text-signal-300",
        className
      )}
    >
      {children}
      {typeof count === "number" ? <span className="text-ink-400">({count})</span> : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
