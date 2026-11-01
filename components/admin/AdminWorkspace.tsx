"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, Check, CheckCircle2, ExternalLink, Loader2, LogOut, Plus, RefreshCw, Send, Upload } from "lucide-react";
import type { ArticleMetadata } from "@/lib/publishing-types";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { EDITOR_DRAFT_KEY, emptyArticleMetadata, mergeComposedMetadata, parseEditorTags, readEditorDraft, shanghaiToday, type EditorDraft, type MetadataField } from "@/lib/markdown-editor";

type ImportResponse = {
  content: string;
  metadata: ArticleMetadata;
  warnings: string[];
  html: string;
};

type PublishResponse = {
  url: string;
  slug: string;
  created: boolean;
};

const inputClass = "mt-2 w-full min-w-0 rounded-md border border-border bg-bg px-3 py-2.5 text-base text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent-soft disabled:opacity-60 sm:text-sm";
const secondaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-secondary transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || "操作未完成，请稍后重试。当前内容已保留。");
  }
  if (body === null) {
    throw new Error("未收到完整结果，请重试。当前内容已保留。");
  }
  return body as T;
}

function errorMessage(error: unknown) {
  if (error instanceof TypeError) return "网络连接暂时不可用，请稍后重试。当前内容已保留。";
  return error instanceof Error ? error.message : "网络连接暂时不可用，请稍后重试。当前内容已保留。";
}

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await readResponse(await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      }));
      setPassword("");
      router.refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-accent">文章工作台</p>
      <h2 className="mt-3 text-2xl font-semibold">登录后发布文章</h2>
      <p className="mt-3 text-sm leading-7 text-secondary">粘贴 Markdown，边写边预览，确认后发布到博客。</p>
      <form onSubmit={login} className="mt-6">
        <label className="block text-sm font-medium text-primary" htmlFor="admin-password">管理员口令</label>
        <input id="admin-password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={busy} className={inputClass} />
        {error ? <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm leading-6 text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
        <button type="submit" disabled={busy || !password} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? "正在登录…" : "登录"}
        </button>
      </form>
    </section>
  );
}

export function AdminWorkspace({ categories, initialDate }: { categories: string[]; initialDate: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef("");
  const busyRef = useRef(false);
  const revisionRef = useRef(0);
  const previewController = useRef<AbortController | null>(null);
  const editedFields = useRef(new Set<MetadataField>());
  const metadataRef = useRef(emptyArticleMetadata(initialDate));
  const previewRef = useRef<{ revision: number; data: ImportResponse } | null>(null);
  const initialized = useRef(false);
  const resumeMetadata = useRef<ArticleMetadata | null>(null);
  const [metadata, setMetadata] = useState(() => emptyArticleMetadata(initialDate));
  const [tagsInput, setTagsInput] = useState("");
  const [source, setSource] = useState("");
  const [filename, setFilename] = useState("");
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState<{ revision: number; data: ImportResponse } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const [draftStatus, setDraftStatus] = useState("尚未输入正文");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [busy, setBusy] = useState<"import" | "publish" | "logout" | null>(null);
  const [error, setError] = useState("");
  const [published, setPublished] = useState<PublishResponse | null>(null);

  const commitMetadata = useCallback((next: ArticleMetadata) => {
    metadataRef.current = next;
    setMetadata(next);
    return next;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let draft: EditorDraft | null = null;
    try { draft = readEditorDraft(window.localStorage.getItem(EDITOR_DRAFT_KEY)); }
    catch { setDraftStatus("此浏览器无法自动保存，请保留原文"); }
    requestIdRef.current = draft?.requestId || crypto.randomUUID();
    if (draft) {
      editedFields.current = new Set(draft.editedFields);
      commitMetadata(draft.metadata);
      setTagsInput(draft.metadata.tags.join("，"));
      // An unchanged restored draft retries the exact metadata snapshot, even
      // across midnight, if the earlier publication response was lost.
      if (draft.requestId && draft.metadata.title && draft.metadata.description && draft.metadata.slug) resumeMetadata.current = draft.metadata;
      setSource(draft.source);
      setFilename(draft.filename);
      setRestored(true);
      revisionRef.current += 1;
      setRevision(revisionRef.current);
    } else {
      setFilename(`pasted-${crypto.randomUUID()}.md`);
    }
    setReady(true);
  }, [commitMetadata]);

  useEffect(() => {
    if (!ready || published) return;
    const save = () => {
      try {
        if (!source.trim()) {
          window.localStorage.removeItem(EDITOR_DRAFT_KEY);
          setDraftStatus("尚未输入正文");
          return;
        }
        const draft: EditorDraft = { version: 1, source, filename, metadata, editedFields: [...editedFields.current], requestId: requestIdRef.current, savedAt: Date.now() };
        window.localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(draft));
        setDraftStatus("草稿已保存到此浏览器");
      } catch { setDraftStatus("草稿未能自动保存，请保留原文"); }
    };
    const saveWhenHidden = () => { if (document.visibilityState === "hidden") save(); };
    const timer = window.setTimeout(save, 400);
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, [source, filename, metadata, ready, published]);

  const applyComposition = useCallback((data: ImportResponse, forRevision: number, forFilename: string) => {
    if (forRevision !== revisionRef.current) return null;
    const next = mergeComposedMetadata(metadataRef.current, resumeMetadata.current ?? data.metadata, editedFields.current);
    commitMetadata(next);
    if (!editedFields.current.has("tags")) setTagsInput(next.tags.join("，"));
    const value = { revision: forRevision, data };
    previewRef.current = value;
    setPreview(value);
    setWarnings(data.warnings ?? []);
    setPreviewError("");
    return value;
  }, [commitMetadata]);

  const compose = useCallback(async (raw: string, forRevision: number, forFilename: string, controller: AbortController) => {
    const result = await readResponse<ImportResponse>(await fetch("/api/admin/compose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: raw, filename: forFilename }), signal: controller.signal
    }));
    if (controller.signal.aborted) return null;
    return applyComposition(result, forRevision, forFilename);
  }, [applyComposition]);

  useEffect(() => {
    if (!ready || !filename || !source.trim() || published || previewRef.current?.revision === revision) return;
    const controller = new AbortController();
    previewController.current?.abort();
    previewController.current = controller;
    const timer = window.setTimeout(async () => {
      if (controller.signal.aborted || revision !== revisionRef.current) return;
      setPreviewLoading(true);
      try { await compose(source, revision, filename, controller); }
      catch (cause) {
        if (!controller.signal.aborted && revision === revisionRef.current) setPreviewError(errorMessage(cause));
      } finally {
        if (!controller.signal.aborted && revision === revisionRef.current) setPreviewLoading(false);
      }
    }, 550);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [source, revision, filename, ready, published, compose]);

  function markChanged() {
    resumeMetadata.current = null;
    requestIdRef.current = crypto.randomUUID();
    setAcknowledged(false);
    setError("");
    setDraftStatus("正在保存草稿…");
  }

  function changeSource(value: string) {
    if (busyRef.current || published) return;
    previewController.current?.abort();
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setSource(value);
    setWarnings([]);
    setPreviewError("");
    setPreviewLoading(false);
    markChanged();
    if (!value.trim()) { previewRef.current = null; setPreview(null); }
  }

  function updateMetadata<K extends MetadataField>(field: K, value: ArticleMetadata[K]) {
    editedFields.current.add(field);
    commitMetadata({ ...metadataRef.current, [field]: value });
    markChanged();
  }

  function newArticle() {
    if (busyRef.current) return;
    if (source.trim() && !published && !window.confirm("开始新文章会清空当前编辑内容。确认继续吗？")) return;
    previewController.current?.abort();
    editedFields.current.clear();
    commitMetadata(emptyArticleMetadata(shanghaiToday()));
    setTagsInput("");
    setSource("");
    setFilename(`pasted-${crypto.randomUUID()}.md`);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    previewRef.current = null;
    setPreview(null);
    setWarnings([]);
    setPreviewError("");
    setPreviewLoading(false);
    setRestored(false);
    setPublished(null);
    markChanged();
    try { window.localStorage.removeItem(EDITOR_DRAFT_KEY); } catch { /* State remains available in memory. */ }
  }

  async function refreshPreview() {
    if (!ready || !source.trim() || busyRef.current || published) return;
    previewController.current?.abort();
    const controller = new AbortController();
    previewController.current = controller;
    const currentRevision = revisionRef.current;
    setPreviewLoading(true);
    setPreviewError("");
    try { await compose(source, currentRevision, filename, controller); }
    catch (cause) { if (!controller.signal.aborted) setPreviewError(errorMessage(cause)); }
    finally { if (!controller.signal.aborted && currentRevision === revisionRef.current) setPreviewLoading(false); }
  }

  async function importFile(file: File) {
    if (busyRef.current) return;
    if (!/\.md$/i.test(file.name)) { setError("请选择 .md 格式的 Markdown 文件。"); return; }
    if (file.size === 0 || file.size > 2 * 1024 * 1024) { setError("文件为空或超过 2 MiB 限制。"); return; }
    if (source.trim() && !published && !window.confirm("导入文件会替换当前编辑内容。确认继续吗？")) return;
    busyRef.current = true;
    previewController.current?.abort();
    setPreviewLoading(false);
    setBusy("import");
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await readResponse<ImportResponse>(await fetch("/api/admin/import", { method: "POST", body: form }));
      const raw = await file.text();
      revisionRef.current += 1;
      const currentRevision = revisionRef.current;
      editedFields.current.clear();
      commitMetadata(emptyArticleMetadata(shanghaiToday()));
      setSource(raw);
      setFilename(file.name);
      setRevision(currentRevision);
      setPublished(null);
      setRestored(false);
      setPreviewLoading(false);
      markChanged();
      applyComposition(result, currentRevision, file.name);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { busyRef.current = false; setBusy(null); }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void importFile(file);
    event.target.value = "";
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prepared = previewRef.current;
    if (busyRef.current || published || !source.trim()) return;
    if (!prepared || prepared.revision !== revisionRef.current || previewError) { setError("请等待最新预览完成，或点击重新预览后发布。"); return; }
    if (prepared.data.warnings.length > 0 && !acknowledged) { setError("请检查文章提醒，并确认按当前内容发布。"); return; }
    busyRef.current = true;
    setBusy("publish");
    setError("");
    previewController.current?.abort();
    setPreviewLoading(false);
    if (!requestIdRef.current) requestIdRef.current = crypto.randomUUID();
    try {
      const result = await readResponse<PublishResponse>(await fetch("/api/admin/publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: prepared.data.content, metadata: metadataRef.current, requestId: requestIdRef.current })
      }));
      setPublished(result);
      setDraftStatus("文章已发布");
      try { window.localStorage.removeItem(EDITOR_DRAFT_KEY); } catch { setDraftStatus("文章已发布；本机旧草稿未清除"); }
      router.refresh();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { busyRef.current = false; setBusy(null); }
  }

  async function logout() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("logout");
    setError("");
    try {
      if (source.trim() && !published) {
        const draft: EditorDraft = { version: 1, source, filename, metadata: metadataRef.current, editedFields: [...editedFields.current], requestId: requestIdRef.current, savedAt: Date.now() };
        window.localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(draft));
      }
    } catch {
      setDraftStatus("草稿未能自动保存，请保留原文");
      setError("草稿未能保存，请先复制正文留存，再退出登录。");
      busyRef.current = false;
      setBusy(null);
      return;
    }
    try {
      await readResponse(await fetch("/api/admin/logout", { method: "POST" }));
      router.refresh();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { busyRef.current = false; setBusy(null); }
  }

  const previewCurrent = preview?.revision === revision && !!source.trim();
  const disabled = busy !== null || published !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-semibold tracking-normal">写文章</h2><p className="mt-2 text-sm leading-7 text-secondary">把 Markdown 直接粘贴到编辑器，边写边预览，确认后发布。</p></div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={newArticle} disabled={busy !== null || !ready} className={secondaryButtonClass}><Plus className="h-4 w-4" aria-hidden="true" />新文章</button>
          <button type="button" onClick={logout} disabled={busy !== null} className={secondaryButtonClass}><LogOut className="h-4 w-4" aria-hidden="true" />退出登录</button>
        </div>
      </div>
      {restored ? <p role="status" className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm leading-7 text-secondary">已恢复上次未发布的本机草稿，可以接着编辑。</p> : null}
      {error ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
      {published ? <div role="status" className="flex flex-col gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5" aria-hidden="true" /><div><p className="font-semibold">文章已发布</p><p className="mt-1 text-sm leading-6">点击“新文章”继续写下一篇。</p></div></div><Link href={published.url} target="_blank" rel="noreferrer" className={secondaryButtonClass}>查看公开文章<ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></div> : null}

      <form onSubmit={publish}>
        <fieldset disabled={disabled} className="min-w-0 space-y-5">
          <MarkdownEditor source={source} onChange={changeSource} html={preview?.data.html ?? ""} metadata={metadata} loading={previewLoading} current={previewCurrent} disabled={disabled} error={previewError} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs leading-6 text-muted">
            <span role="status">{draftStatus} · 草稿只保存在当前浏览器</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={refreshPreview} disabled={!source.trim() || previewLoading} className={secondaryButtonClass}><RefreshCw className={`h-4 w-4 ${previewLoading ? "animate-spin" : ""}`} aria-hidden="true" />重新预览</button>
              <input ref={fileInputRef} type="file" accept=".md,text/markdown" onChange={chooseFile} className="hidden" tabIndex={-1} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={secondaryButtonClass}><Upload className="h-4 w-4" aria-hidden="true" />也可导入 .md</button>
            </div>
          </div>
          <section className="rounded-xl border border-border bg-surface p-5 sm:p-6" aria-label="文章信息">
            <div className="mb-5"><h3 className="font-semibold">文章信息</h3><p className="mt-1 text-xs leading-6 text-muted">从原文自动提取，也可以直接修改。手动修改的字段会保留。</p></div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium">标题<input name="title" value={metadata.title} onChange={(event) => updateMetadata("title", event.target.value)} required maxLength={200} placeholder="从 Markdown 的一级标题自动提取" className={inputClass} /></label>
              <label className="block text-sm font-medium">文章地址<input name="slug" value={metadata.slug} onChange={(event) => updateMetadata("slug", event.target.value)} required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="自动生成，可自定义" className={`${inputClass} font-mono`} /></label>
              <label className="block text-sm font-medium md:col-span-2">摘要<textarea name="description" value={metadata.description} onChange={(event) => updateMetadata("description", event.target.value)} required rows={3} maxLength={500} placeholder="从正文首段自动提取" className={`${inputClass} resize-y leading-7`} /></label>
              <label className="block text-sm font-medium">日期<input type="date" name="date" value={metadata.date} onChange={(event) => updateMetadata("date", event.target.value)} required className={inputClass} /></label>
              <label className="block text-sm font-medium">分类<input name="category" value={metadata.category} onChange={(event) => updateMetadata("category", event.target.value)} required maxLength={60} list="article-categories" className={inputClass} /><datalist id="article-categories">{Array.from(new Set(["未分类", ...categories])).map((category) => <option key={category} value={category} />)}</datalist></label>
              <label className="block text-sm font-medium">标签<input name="tags" value={tagsInput} onChange={(event) => { setTagsInput(event.target.value); updateMetadata("tags", parseEditorTags(event.target.value)); }} onBlur={() => setTagsInput(metadataRef.current.tags.join("，"))} placeholder="例如：5G，系统仿真，AI Coding" className={inputClass} /><span className="mt-1 block text-xs font-normal text-muted">用中文或英文逗号分隔，可留空。</span></label>
              <label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-border bg-surface-elevated px-3 py-3 text-sm"><input type="checkbox" name="featured" checked={metadata.featured} onChange={(event) => updateMetadata("featured", event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />设为精选文章</label>
            </div>
          </section>
          {warnings.length > 0 && previewCurrent ? <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><h3 className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" aria-hidden="true" />发布前的提醒</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{warnings.map((warning, index) => <li key={index} className="break-words">{warning}</li>)}</ul><label className="mt-4 flex items-start gap-3 border-t border-amber-200 pt-4 text-sm leading-7 dark:border-amber-800"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--accent)]" />我已检查提醒，确认按当前内容发布。</label></section> : null}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{published ? "这篇文章已经公开" : "预览满意后，再确认发布"}</p><p className="mt-1 text-xs leading-6 text-muted">编辑和预览不会公开文章。已有文章地址不会被覆盖。</p></div><button type="submit" disabled={disabled || !source.trim() || !previewCurrent || !!previewError || (warnings.length > 0 && !acknowledged)} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50">{busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : published ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}{busy === "publish" ? "正在发布…" : published ? "已发布" : !previewCurrent && source.trim() ? "等待预览…" : "确认发布"}</button></div>
        </fieldset>
      </form>
    </div>
  );
}
