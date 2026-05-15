"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArticleBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const updateVisibility = () => {
      setVisible(window.scrollY > 720);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", requestUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="返回文章顶部"
      title="返回顶部"
      className={cn(
        "fixed bottom-20 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/95 text-primary shadow-soft backdrop-blur-xl transition duration-200 dark:shadow-soft-dark sm:bottom-20",
        "hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
