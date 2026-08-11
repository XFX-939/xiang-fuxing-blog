"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const roundedProgress = Math.round(progress);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      const element = document.documentElement;
      const readingSurface = document.querySelector<HTMLElement>("[data-reading-surface]");
      let start = 0;
      let end = element.scrollHeight - window.innerHeight;

      if (readingSurface) {
        const surfaceTop = window.scrollY + readingSurface.getBoundingClientRect().top;
        start = Math.max(0, surfaceTop - window.innerHeight * 0.2);
        end = surfaceTop + readingSurface.offsetHeight - window.innerHeight * 0.72;
      }

      const scrollable = Math.max(0, end - start);
      const value = scrollable > 0 ? ((window.scrollY - start) / scrollable) * 100 : 0;
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
      <div
        className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-border/60"
        role="progressbar"
        aria-label="文章阅读进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedProgress}
      >
        <div
          className="h-full origin-left bg-accent transition-transform duration-100 ease-out will-change-transform"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <div
        className="fixed bottom-5 right-5 z-[45] hidden items-center gap-2 border border-border border-l-2 border-l-accent bg-surface/90 px-3 py-2 text-[11px] font-semibold tracking-[0.06em] text-secondary backdrop-blur-xl sm:flex"
        aria-label={`阅读进度 ${roundedProgress}%`}
      >
        <span>已读</span>
        <span className="tabular-nums text-accent">{roundedProgress}%</span>
      </div>
    </>
  );
}
