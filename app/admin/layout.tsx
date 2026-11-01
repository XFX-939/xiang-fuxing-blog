import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";
import "@/styles/classic.css";

export const metadata: Metadata = {
  title: "文章发布后台",
  description: "导入 Markdown，预览并发布博客文章。",
  alternates: { canonical: absoluteUrl("/admin") },
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-ui-version="classic" className="min-h-screen bg-bg text-primary">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-muted">向福星的个人博客</p>
              <h1 className="mt-1 text-lg font-semibold">文章发布</h1>
            </div>
          </div>
          <Link href="/" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-secondary transition hover:bg-surface-elevated hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            返回博客
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
