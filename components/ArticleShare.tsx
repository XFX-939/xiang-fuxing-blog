"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ArticleShareProps = {
  url: string;
  title: string;
  className?: string;
};

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ArticleShare({ url, title, className }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    await copyText(url);
    setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`复制文章链接：${title}`}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-secondary transition",
        "hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft",
        copied && "border-accent bg-accent-soft text-accent",
        className
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      <span>{copied ? "已复制" : "复制链接"}</span>
    </button>
  );
}
