"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useActiveHeading } from "@/components/useActiveHeading";

export type MethodologyTocItem = {
  id: string;
  label: string;
};

type MethodologyNavigationProps = {
  items: MethodologyTocItem[];
};

export function MethodologyNavigation({ items }: MethodologyNavigationProps) {
  const activeId = useActiveHeading(items);
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const element = document.documentElement;
      const scrollable = element.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? (element.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
      setShowBackToTop(window.scrollY > 720);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const list = (
    <ol className="grid gap-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className={cn(
              "block rounded-md border-l-2 border-transparent px-3 py-2 text-sm leading-5 text-secondary transition hover:border-accent/70 hover:bg-accent-soft hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              activeId === item.id && "border-accent bg-accent-soft font-semibold text-accent"
            )}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-border/60" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-signal-500 via-cyan-400 to-violet-400 shadow-[0_0_14px_rgba(56,189,248,0.35)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="lg:hidden">
        <details className="group rounded-[18px] border border-border bg-surface p-4 shadow-sm sm:rounded-md">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left marker:hidden">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contents</span>
              <span className="mt-1 block text-sm font-semibold text-primary">页面目录</span>
            </span>
            <span className="text-xs font-medium text-accent group-open:hidden">展开</span>
            <span className="hidden text-xs font-medium text-accent group-open:inline">收起</span>
          </summary>
          <nav aria-label="方法论页面目录" className="mt-4 max-h-[52vh] overflow-y-auto pr-1">
            {list}
          </nav>
        </details>
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-32 lg:self-start">
        <nav aria-label="方法论页面目录" className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contents</p>
          <p className="mt-1 text-sm font-semibold text-primary">页面目录</p>
          <div className="mt-4">{list}</div>
        </nav>
      </aside>

      <button
        type="button"
        aria-label="返回方法论页面顶部"
        title="返回顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-6 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/95 text-primary shadow-soft backdrop-blur-xl transition duration-200 dark:shadow-soft-dark",
          "hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft",
          showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </>
  );
}
