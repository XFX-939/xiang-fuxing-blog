import { Tag } from "@/components/Tag";
import { cn } from "@/lib/utils";

type TagListProps = {
  tags: string[];
  maxVisible?: number;
  getHref?: (tag: string) => string;
  compact?: boolean;
  showMore?: boolean;
  className?: string;
};

export function TagList({
  tags,
  maxVisible = 3,
  getHref,
  compact = false,
  showMore = true,
  className
}: TagListProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  return (
    <div className={cn("flex max-w-full flex-wrap gap-2", compact && "gap-1.5", className)}>
      {visibleTags.map((tag) => (
        <Tag
          key={tag}
          href={getHref?.(tag)}
          className={cn(
            "max-w-full",
            compact && "px-2 py-0.5 text-[11px]"
          )}
        >
          {tag}
        </Tag>
      ))}
      {showMore && hiddenCount > 0 ? (
        <span
          className={cn(
            "inline-flex items-center rounded-md border border-border bg-tag-bg px-2.5 py-1 text-xs font-medium text-muted",
            compact && "px-2 py-0.5 text-[11px]"
          )}
        >
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
