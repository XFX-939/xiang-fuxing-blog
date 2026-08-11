"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const roundedProgress = Math.round(progress);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      const element = document.documentElement;
      const scrollable = element.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? (element.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-border/60" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-signal-500 via-cyan-400 to-violet-400 shadow-[0_0_14px_rgba(56,189,248,0.4)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className="fixed bottom-5 right-5 z-[45] hidden items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-semibold text-secondary shadow-soft backdrop-blur-xl dark:shadow-soft-dark sm:flex"
        aria-label={`阅读进度 ${roundedProgress}%`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span>阅读进度</span>
        <span className="tabular-nums text-accent">{roundedProgress}%</span>
      </div>
    </>
  );
}
