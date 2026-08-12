"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NavLink } from "@/components/NavLink";
import { UIVersionSwitch } from "@/components/UIVersionSwitch";
import { navItems } from "@/lib/site";
import { topicHubs } from "@/lib/topics";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="xl:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "关闭导航" : "打开导航"}
        title={open ? "关闭导航" : "打开导航"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center border border-[#171816] bg-[#171816] text-[#f3eee4] transition-colors hover:border-[#f15a29] hover:bg-[#f15a29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f15a29] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3eee4] dark:border-[#f3eee4] dark:bg-[#f3eee4] dark:text-[#111820] dark:hover:border-[#ff7043] dark:hover:bg-[#ff7043] dark:focus-visible:ring-offset-[#0d141b]"
      >
        {open ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Menu className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-[#171816]/55" aria-hidden="true" onMouseDown={closeMenu} />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="全站导航"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[25rem] flex-col overscroll-contain overflow-y-auto border-l border-white/20 bg-[#111a22] px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-5 text-[#f3eee4] sm:px-7"
          >
            <div className="flex items-start justify-between gap-6 border-b border-white/20 pb-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8db4cc]">
                  Signal Field Notes
                </p>
                <p className="mt-2 text-xl font-bold tracking-[0.08em]">全站导航</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="关闭导航"
                title="关闭导航"
                onClick={closeMenu}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 text-[#f3eee4] transition-colors hover:border-[#ff7043] hover:bg-[#ff7043] hover:text-[#111820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7043] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111a22]"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <GlobalSearch className="mt-6" onNavigate={closeMenu} placeholder="检索文章与主题..." />

            <div className="mt-4 flex items-center justify-between gap-4 border-y border-white/15 py-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8db4cc]">界面版本</p>
              <UIVersionSwitch active="signal" tone="ink" />
            </div>

            <nav className="mt-7" aria-label="移动端主导航">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  variant="mobile"
                  onClick={closeMenu}
                />
              ))}
            </nav>

            <div className="mt-10 border-t border-white/20 pt-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-0.5 w-7 bg-[#f15a29]" aria-hidden="true" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8db4cc]">专题索引</p>
              </div>
              <div className="grid grid-cols-2 border-l border-t border-white/15">
                {topicHubs.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={topic.href}
                    onClick={closeMenu}
                    className="border-b border-r border-white/15 px-3 py-3 text-sm font-semibold text-[#d8d3c8] transition-colors hover:bg-[#f15a29] hover:text-[#111820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff7043]"
                  >
                    {topic.title}
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-auto border-t border-white/15 pt-6 text-xs leading-6 text-[#8fa0aa]">
              无线通信、系统仿真、AI 辅助研发与技术管理的持续记录。
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
