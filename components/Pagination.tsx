"use client";

type PaginationProps = {
  visible: number;
  total: number;
  onLoadMore: () => void;
};

export function Pagination({ visible, total, onLoadMore }: PaginationProps) {
  if (visible >= total) {
    return null;
  }

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
      >
        加载更多文章
      </button>
    </div>
  );
}
