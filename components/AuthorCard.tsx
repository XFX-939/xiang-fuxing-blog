import Link from "next/link";
import { Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function AuthorCard() {
  return (
    <section className="rounded-md border border-ink-200 bg-ink-50 p-5 dark:border-ink-800 dark:bg-ink-900/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-950 dark:text-white">{siteConfig.author}</p>
          <p className="mt-2 text-sm leading-7 text-ink-600 dark:text-ink-300">
            无线通信算法工程师，关注系统仿真、AI for RAN、研发效能和技术团队管理。
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:border-signal-400 hover:text-signal-700 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-signal-600 dark:hover:text-signal-300"
        >
          <Mail className="h-4 w-4" />
          了解作者
        </Link>
      </div>
    </section>
  );
}
