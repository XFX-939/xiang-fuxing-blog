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
        className="rounded-md border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-signal-400 hover:text-signal-700 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-signal-600 dark:hover:text-signal-300"
      >
        加载更多文章
      </button>
    </div>
  );
}
