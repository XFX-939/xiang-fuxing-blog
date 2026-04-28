import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[58vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-700 dark:text-signal-300">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-ink-950 dark:text-white">页面不存在</h1>
      <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">
        这条内容可能还没有沉淀出来，或者已经被移动。
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-800 dark:bg-white dark:text-ink-950 dark:hover:bg-signal-100"
      >
        返回首页
      </Link>
    </div>
  );
}
