"use client";

import { useRef, useState } from "react";
import { Bold, Code2, Columns2, Eye, FileCode2, Heading2, Italic, Link2, List, Loader2, Quote, Table2 } from "lucide-react";
import { applyMarkdownEdit, type MarkdownAction } from "@/lib/markdown-editor";
import type { ArticleMetadata } from "@/lib/publishing-types";

const tools: Array<{ action: MarkdownAction; label: string; icon: typeof Bold }> = [
  { action: "heading", label: "二级标题", icon: Heading2 },
  { action: "bold", label: "加粗（⌘/Ctrl+B）", icon: Bold },
  { action: "italic", label: "斜体（⌘/Ctrl+I）", icon: Italic },
  { action: "list", label: "无序列表", icon: List },
  { action: "quote", label: "引用", icon: Quote },
  { action: "link", label: "插入链接（⌘/Ctrl+K）", icon: Link2 },
  { action: "code", label: "代码块", icon: Code2 },
  { action: "table", label: "表格", icon: Table2 }
];

export function MarkdownEditor({ source, onChange, html, metadata, loading, current, disabled, error }: {
  source: string; onChange: (source: string) => void; html: string; metadata: ArticleMetadata;
  loading: boolean; current: boolean; disabled: boolean; error: string;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const escapeTab = useRef(false);
  const [view, setView] = useState<"split" | "write" | "preview">("split");

  function insert(action: MarkdownAction) {
    const input = textarea.current;
    if (!input || disabled) return;
    const next = applyMarkdownEdit(source, input.selectionStart, input.selectionEnd, action);
    onChange(next.value);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(next.selectionStart, next.selectionEnd); });
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface" aria-label="Markdown 编辑器">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="font-semibold text-primary">Markdown 编辑器</h3>
          <p className="mt-1 text-xs leading-5 text-muted">直接粘贴原文，或在这里开始写作。支持表格、公式和代码块。</p>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-surface-elevated p-1" role="group" aria-label="编辑器显示方式">
          {([{ value: "split", label: "分栏", icon: Columns2 }, { value: "write", label: "编辑", icon: FileCode2 }, { value: "preview", label: "预览", icon: Eye }] as const).map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={`inline-flex min-h-10 items-center gap-1.5 rounded px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${view === value ? "bg-surface text-accent shadow-sm" : "text-secondary"}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-elevated px-3 py-2" role="toolbar" aria-label="Markdown 格式工具">
        {tools.map(({ action, label, icon: Icon }) => <button key={action} type="button" title={label} aria-label={label} disabled={disabled || view === "preview"} onMouseDown={(event) => event.preventDefault()} onClick={() => insert(action)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary transition hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"><Icon className="h-4 w-4" aria-hidden="true" /></button>)}
        <span className="ml-auto px-2 text-xs text-muted">{Array.from(source).length.toLocaleString("zh-CN")} 字</span>
      </div>
      <div className={view === "split" ? "grid min-w-0 lg:grid-cols-2" : "min-w-0"}>
        {view !== "preview" ? (
          <div className={`min-w-0 ${view === "split" ? "border-b border-border lg:border-b-0 lg:border-r" : ""}`}>
            <label htmlFor="article-content" className="sr-only">Markdown 正文</label>
            <textarea ref={textarea} id="article-content" name="content" aria-label="Markdown 正文" value={source} onChange={(event) => onChange(event.target.value)} disabled={disabled} spellCheck={false} placeholder={"# 在这里粘贴文章标题\n\n把 Markdown 正文直接粘贴到这里，右侧会自动显示预览。\n\n## 小标题\n\n支持 **加粗**、列表、表格、代码和数学公式。"} onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") { escapeTab.current = true; return; }
              if (event.key === "Tab" && escapeTab.current) { escapeTab.current = false; return; }
              escapeTab.current = false;
              if ((event.metaKey || event.ctrlKey) && ["b", "i", "k"].includes(event.key.toLowerCase())) {
                event.preventDefault(); insert(({ b: "bold", i: "italic", k: "link" } as const)[event.key.toLowerCase() as "b" | "i" | "k"]);
              } else if (event.key === "Tab") { event.preventDefault(); insert(event.shiftKey ? "outdent" : "indent"); }
            }} className="block min-h-[460px] w-full resize-y border-0 bg-bg p-5 font-mono text-[14px] leading-7 text-primary outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-inset focus:ring-accent disabled:opacity-70 lg:min-h-[600px]" />
          </div>
        ) : null}
        {view !== "write" ? (
          <div className="min-w-0 bg-surface">
            <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-5 py-2 text-xs text-muted" role="status">
              <span>阅读预览</span><span className="inline-flex items-center gap-1.5">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}{loading ? "正在更新…" : current ? "预览已更新" : source.trim() ? "等待更新" : "等待粘贴正文"}</span>
            </div>
            {error ? <p role="alert" className="m-4 rounded-md bg-red-50 p-3 text-sm leading-6 text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
            {html ? <article className="min-w-0 px-5 py-6 sm:px-7"><header className="mb-6 border-b border-border pb-5"><p className="text-xs text-muted">{metadata.category} · {metadata.date}</p><h2 className="mt-3 break-words text-2xl font-semibold leading-tight">{metadata.title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{metadata.description}</p></header><div className="markdown-body article-content prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} /></article> : <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-12 text-center text-muted"><Eye className="h-9 w-9 opacity-40" aria-hidden="true" /><p className="text-sm leading-7">粘贴 Markdown 后自动生成安全预览。<br />预览和编辑都不会公开文章。</p></div>}
          </div>
        ) : null}
      </div>
    </section>
  );
}
