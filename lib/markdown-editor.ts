import type { ArticleMetadata } from "@/lib/publishing-types";

export type MetadataField = keyof ArticleMetadata;
export const metadataFields: MetadataField[] = ["title", "description", "date", "category", "tags", "featured", "slug"];
export const EDITOR_DRAFT_KEY = "xiang-fuxing-blog-markdown-draft-v1";

export type EditorDraft = {
  version: 1;
  source: string;
  /** The uploaded file's name; empty for pasted text. */
  filename: string;
  metadata: ArticleMetadata;
  editedFields: MetadataField[];
  requestId?: string;
  savedAt: number;
};

// Drafts saved before pasted text was composed without a filename stored this placeholder.
const LEGACY_PASTED_FILENAME = /^pasted-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/i;

export function parseEditorTags(value: string) {
  return Array.from(new Set(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)));
}

export function shanghaiToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function emptyArticleMetadata(date: string): ArticleMetadata {
  return { title: "", description: "", date, category: "未分类", tags: [], featured: false, slug: "" };
}

/** Only untouched fields follow the pasted Markdown; manual edits always win. */
export function mergeComposedMetadata(current: ArticleMetadata, derived: ArticleMetadata, edited: ReadonlySet<MetadataField>): ArticleMetadata {
  return Object.fromEntries(metadataFields.map((field) => [field, edited.has(field) ? current[field] : derived[field]])) as ArticleMetadata;
}

export function readEditorDraft(raw: string | null): EditorDraft | null {
  if (!raw || raw.length > 4 * 1024 * 1024) return null;
  try {
    const draft = JSON.parse(raw) as EditorDraft;
    if (draft?.version !== 1 || typeof draft.source !== "string" || !draft.source.trim() ||
      new TextEncoder().encode(draft.source).byteLength > 2 * 1024 * 1024 ||
      typeof draft.filename !== "string" || (draft.filename !== "" && (!/\.md$/i.test(draft.filename) || /[\\/\u0000-\u001f]/.test(draft.filename))) ||
      !Number.isFinite(draft.savedAt) || !Array.isArray(draft.editedFields) ||
      !draft.editedFields.every((field) => metadataFields.includes(field))) return null;
    if (draft.requestId !== undefined && (typeof draft.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(draft.requestId))) return null;
    const metadata = draft.metadata;
    if (!metadata || typeof metadata !== "object" ||
      ![metadata.title, metadata.description, metadata.date, metadata.category, metadata.slug].every((value) => typeof value === "string") ||
      typeof metadata.featured !== "boolean" || !Array.isArray(metadata.tags) || metadata.tags.length > 20 ||
      !metadata.tags.every((tag) => typeof tag === "string" && tag.length <= 100)) return null;
    return { ...draft, filename: LEGACY_PASTED_FILENAME.test(draft.filename) ? "" : draft.filename, metadata: { ...metadata }, editedFields: [...draft.editedFields] };
  } catch { return null; }
}

export type MarkdownAction = "heading" | "bold" | "italic" | "list" | "quote" | "link" | "code" | "table" | "indent" | "outdent";

export function applyMarkdownEdit(value: string, start: number, end: number, action: MarkdownAction) {
  start = Math.max(0, Math.min(start, value.length));
  end = Math.max(start, Math.min(end, value.length));
  const selected = value.slice(start, end);
  let replacement = "";
  let offset = 0;
  let length = 0;
  if (["heading", "list", "quote", "indent", "outdent"].includes(action)) {
    const cursor = start;
    const selectedEnd = end > start && value[end - 1] === "\n" ? end - 1 : end;
    start = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", selectedEnd);
    end = lineEnd === -1 ? value.length : lineEnd;
    const prefix = ({ heading: "## ", list: "- ", quote: "> ", indent: "  " } as Partial<Record<MarkdownAction, string>>)[action] ?? "";
    const lines = value.slice(start, end).split("\n");
    replacement = lines.map((line) => action === "outdent" ? line.replace(/^(?: {1,2}|\t)/, "") : `${prefix}${line}`).join("\n");
    const removed = action === "outdent" ? lines[0].length - lines[0].replace(/^(?: {1,2}|\t)/, "").length : 0;
    offset = selected ? 0 : Math.max(0, cursor - start - removed + prefix.length);
    length = selected ? replacement.length : 0;
  } else if (action === "bold" || action === "italic") {
    const mark = action === "bold" ? "**" : "*";
    const text = selected || (action === "bold" ? "加粗文字" : "斜体文字");
    replacement = `${mark}${text}${mark}`;
    offset = mark.length; length = text.length;
  } else if (action === "link") {
    replacement = `[${selected || "链接文字"}](https://)`;
    offset = selected ? replacement.indexOf("https://") : 1;
    length = selected ? 8 : 4;
  } else if (action === "code") {
    const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
    replacement = `${prefix}\`\`\`text\n${selected || "在这里粘贴代码"}\n\`\`\`\n`;
    offset = prefix.length + 8; length = (selected || "在这里粘贴代码").length;
  } else {
    replacement = `${start > 0 && value[start - 1] !== "\n" ? "\n" : ""}| 列一 | 列二 |\n| --- | --- |\n| 内容 | 内容 |\n`;
    length = replacement.length;
  }
  return { value: value.slice(0, start) + replacement + value.slice(end), selectionStart: start + offset, selectionEnd: start + offset + length };
}
