"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

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
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-signal-500 via-cyan-400 to-violet-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
