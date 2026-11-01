import "server-only";

import { load, JSON_SCHEMA } from "js-yaml";
import type { Element, Root } from "hast";
import type { Root as MarkdownRoot } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";
import type { TocItem } from "./posts";
import type { ArticleMetadata, HeadingAnchor, ImportedMarkdown } from "./publishing-types";
import { automaticSlug, availableSlug, isUsableSlug, RESERVED_SLUGS, SLUG_PATTERN } from "./slug";

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const METADATA_KEYS = new Set(["title", "description", "date", "category", "tags", "featured", "slug"]);
const FORBIDDEN_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export class MarkdownValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "MarkdownValidationError";
  }
}

function assertSource(source: unknown): asserts source is string {
  if (typeof source !== "string" || !source.trim()) {
    throw new MarkdownValidationError("Markdown 正文不能为空。");
  }
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    throw new MarkdownValidationError("Markdown 文件不能超过 2 MiB。");
  }
  // UTF-8 must also be decoded with a fatal TextDecoder at the upload boundary.
  if (source.includes("\u0000") || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(source)) {
    throw new MarkdownValidationError("文件包含无效文本，请使用 UTF-8 编码的 Markdown 文件。");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || FORBIDDEN_CONTROLS.test(value)) {
    throw new MarkdownValidationError(`${label}必须是有效文本。`);
  }
  const text = value.trim().replace(/\s+/g, " ");
  if (!text || Array.from(text).length > maxLength) {
    throw new MarkdownValidationError(`${label}不能为空，且不能超过 ${maxLength} 个字符。`);
  }
  return text;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateArticleMetadata(input: unknown): ArticleMetadata {
  if (!isRecord(input) || Object.keys(input).some((key) => !METADATA_KEYS.has(key))) {
    throw new MarkdownValidationError("文章信息格式不正确，请检查标题、摘要、日期、分类、标签和短链。");
  }
  const title = validateText(input.title, "标题", 200);
  const description = validateText(input.description, "摘要", 500);
  const category = validateText(input.category, "分类", 60);
  const date = input.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new MarkdownValidationError("日期必须使用 YYYY-MM-DD 格式。");
  }
  if (!isValidDate(date)) {
    throw new MarkdownValidationError("日期不存在，请填写真实的年月日。");
  }
  if (typeof input.slug !== "string" || input.slug.length > 120 || !SLUG_PATTERN.test(input.slug) || RESERVED_SLUGS.has(input.slug)) {
    throw new MarkdownValidationError("短链只能使用小写英文字母、数字和单个连字符，最长 120 字符，且不能使用保留名称。");
  }
  if (!Array.isArray(input.tags) || input.tags.length > 20) {
    throw new MarkdownValidationError("标签必须是数组，且不能超过 20 个。");
  }
  const tags = Array.from(new Set(input.tags.map((tag) => validateText(tag, "标签", 50))));
  if (typeof input.featured !== "boolean") {
    throw new MarkdownValidationError("精选标记 featured 必须为 true 或 false。");
  }
  return { title, description, date, category, tags, featured: input.featured, slug: input.slug };
}

function parseMarkdown(source: string): MarkdownRoot {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(source);
}

function nodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const item = node as { value?: unknown; children?: unknown[]; alt?: unknown };
  if (typeof item.value === "string") return item.value;
  if (typeof item.alt === "string") return item.alt;
  return item.children?.map(nodeText).join("") ?? "";
}

function shanghaiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function safeImageUrl(value: string) {
  if (/[\s\u0000-\u001f\u007f\\]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !!url.hostname;
  } catch {
    return false;
  }
}

export function getMarkdownWarnings(content: string): string[] {
  assertSource(content);
  const tree = parseMarkdown(content);
  const definitions = new Map<string, string>();
  const images = new Set<string>();
  let hasHtml = false;
  visit(tree, "definition", (node) => { definitions.set(node.identifier.toLowerCase(), node.url); });
  visit(tree, (node) => {
    if (node.type === "html") hasHtml = true;
    if (node.type === "image") images.add(node.url);
    if (node.type === "imageReference") {
      const url = definitions.get(node.identifier.toLowerCase());
      if (url) images.add(url);
    }
  });
  const warnings: string[] = [];
  for (const image of images) {
    if (!safeImageUrl(image)) warnings.push(`图片引用「${image}」不会显示：仅支持 HTTPS 图片地址或以 / 开头的站内绝对路径，请替换相对路径或其他协议。`);
  }
  if (hasHtml) warnings.push("原文中的 HTML 或 JSX 标签会被忽略；请使用标准 Markdown 语法。");
  return warnings;
}

export type ImportOptions = {
  /** The title typed in the editor, which an automatic URL should follow. */
  slugTitle?: string;
  /** Reports URLs owned by another article, so automatic URLs avoid them. */
  isSlugTaken?: (slug: string) => boolean;
};

function pastedTitle(tree: MarkdownRoot): string {
  const paragraph = tree.children.find((node) => node.type === "paragraph" && nodeText(node).trim());
  const text = (paragraph ? nodeText(paragraph) : nodeText(tree)).replace(/\s+/g, " ").trim();
  return Array.from(text).slice(0, 30).join("").trim() || "未命名文章";
}

export function importMarkdown(source: string, filename?: string, options: ImportOptions = {}): ImportedMarkdown {
  assertSource(source);
  if (filename !== undefined && (typeof filename !== "string" || !/\.md$/i.test(filename) || /[\\/\u0000-\u001f\u007f]/.test(filename))) {
    throw new MarkdownValidationError("只接受 UTF-8 编码的 .md 文件，请勿上传 MDX 或其他文件。");
  }
  let content = source.startsWith("\uFEFF") ? source.slice(1) : source;
  let frontmatter: Record<string, unknown> = {};
  const opening = /^---[ \t]*\r?\n/.exec(content);
  if (opening) {
    const remaining = content.slice(opening[0].length);
    const closing = /^---[ \t]*(?:\r?\n|$)/m.exec(remaining);
    if (!closing) throw new MarkdownValidationError("frontmatter 缺少结束分隔线 ---。");
    try {
      const data: unknown = load(remaining.slice(0, closing.index), { schema: JSON_SCHEMA });
      if (data !== undefined && !isRecord(data)) throw new Error("Invalid metadata mapping");
      frontmatter = (data ?? {}) as Record<string, unknown>;
    } catch {
      throw new MarkdownValidationError("frontmatter 不是有效的 YAML 信息；不支持代码、可执行标签或重复字段。");
    }
    content = remaining.slice(closing.index + closing[0].length);
  } else if (/^---[^\s-]/.test(content)) {
    throw new MarkdownValidationError("仅支持使用 --- 分隔的 YAML frontmatter，不支持可执行语言标记。");
  }
  assertSource(content);
  const tree = parseMarkdown(content);
  // Pasted text has no file identity, so only a real upload name can name an article.
  const stem = filename === undefined ? undefined : filename.slice(0, -3).trim();
  let heading = "";
  visit(tree, "heading", (node) => { if (!heading && node.depth === 1) heading = nodeText(node).trim(); });
  const paragraph = tree.children.find((node) => node.type === "paragraph" && nodeText(node).trim());
  const title = validateText(Object.hasOwn(frontmatter, "title") ? frontmatter.title : heading || (stem ?? pastedTitle(tree)), "标题", 200);
  const pick = (key: string, fallback: unknown) => Object.hasOwn(frontmatter, key) ? frontmatter[key] : fallback;
  const date = isValidDate(frontmatter.date) ? frontmatter.date : shanghaiDate();
  let slug: unknown;
  let renamedFrom = "";
  if (Object.hasOwn(frontmatter, "slug")) {
    slug = frontmatter.slug;
  } else if (stem !== undefined && isUsableSlug(stem)) {
    slug = stem;
  } else {
    const requested = typeof options.slugTitle === "string" ? Array.from(options.slugTitle.trim()).slice(0, 200).join("") : "";
    const base = automaticSlug(requested || title);
    slug = options.isSlugTaken ? availableSlug(base, options.isSlugTaken) : base;
    if (slug !== base) renamedFrom = base;
  }
  const metadata = validateArticleMetadata({
    title,
    description: pick("description", Array.from(paragraph ? nodeText(paragraph).replace(/\s+/g, " ").trim() : title).slice(0, 200).join("")),
    date,
    category: pick("category", "未分类"),
    tags: pick("tags", []),
    featured: pick("featured", false),
    slug
  });
  const warnings = getMarkdownWarnings(content);
  if (Object.hasOwn(frontmatter, "date") && !isValidDate(frontmatter.date)) warnings.unshift(`原文日期无效，已使用上海当天日期 ${date}；可在发布前修改。`);
  if (renamedFrom) warnings.unshift(`文章地址「${renamedFrom}」已被其他文章使用，已自动改为「${metadata.slug}」；如果是重复发布同一篇文章，请不要继续。`);
  if (frontmatter.draft === true) warnings.unshift("原文标记为草稿；确认发布后将公开展示，请核对发布意图。");
  const ignored = Object.keys(frontmatter).filter((key) => !METADATA_KEYS.has(key) && key !== "draft");
  if (ignored.length) warnings.push(`以下 frontmatter 字段不参与发布：${ignored.join("、")}。`);
  return { content, metadata, warnings };
}

/** The article page already shows its title: drop a leading H1 and keep other headings below it. */
function articleHeadings() {
  return (tree: MarkdownRoot) => {
    const first = tree.children.findIndex((node) => node.type !== "html" && node.type !== "definition");
    const lead = tree.children[first];
    if (lead?.type === "heading" && lead.depth === 1) tree.children.splice(first, 1);
    visit(tree, "heading", (node) => { if (node.depth === 1) node.depth = 2; });
  };
}

function safeUrls() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        if (typeof node.properties.src !== "string" || !safeImageUrl(node.properties.src)) {
          const alt = typeof node.properties.alt === "string" ? node.properties.alt : "";
          node.tagName = "span";
          node.properties = {};
          node.children = [{ type: "text", value: alt }];
        } else {
          node.properties.loading = "lazy";
        }
      }
      if (node.tagName === "a" && typeof node.properties.href === "string") {
        const href = node.properties.href;
        try {
          const url = new URL(href, "https://markdown.invalid");
          if (/[\u0000-\u0020\u007f]/.test(href) || !["https:", "http:", "mailto:"].includes(url.protocol)) {
            delete node.properties.href;
          } else if (/^https?:\/\//i.test(href) || href.startsWith("//")) {
            node.properties.target = "_blank";
            node.properties.rel = ["noopener", "noreferrer"];
          }
        } catch {
          delete node.properties.href;
        }
      }
    });
  };
}

export async function renderMarkdown(content: string): Promise<{ html: string; toc: TocItem[]; anchors: HeadingAnchor[] }> {
  assertSource(content);
  const toc: TocItem[] = [];
  const anchors: HeadingAnchor[] = [];
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(articleHeadings)
      // No remark-mdx, evaluation, raw HTML expansion, or user-defined plugins.
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(safeUrls)
      // Author HTML never enters the HAST. Only these trusted renderers may
      // produce the styles and markup required by math and code highlighting.
      .use(rehypeKatex, { trust: false, strict: "ignore", maxExpand: 1000 })
      .use(rehypePrettyCode, {
        theme: { dark: "github-dark", light: "github-light" },
        keepBackground: false,
        // Untrusted highlight ranges can request enormous expansions even in
        // a tiny file. Basic highlighting does not need code-fence metadata.
        filterMetaString: () => "",
        defaultLang: { block: "text", inline: "text" }
      })
      .use(rehypeSlug, { prefix: "user-content-" })
      .use(() => (tree: Root) => {
        visit(tree, "element", (node: Element) => {
          const depth = /^h([1-6])$/.exec(node.tagName)?.[1];
          if (!depth || typeof node.properties.id !== "string") return;
          if (depth === "2" || depth === "3") toc.push({ id: node.properties.id, text: nodeText(node), depth: Number(depth) });
          // Generated headings, such as the footnote label, have no source line.
          if (node.position) anchors.push({ id: node.properties.id, line: node.position.start.line });
        });
      });
    const tree = await processor.run(processor.parse(content));
    return { html: toHtml(tree, { allowDangerousHtml: false }), toc, anchors };
  } catch (error) {
    if (error instanceof MarkdownValidationError) throw error;
    throw new MarkdownValidationError("Markdown 无法渲染，请检查公式或代码块语法后重试。");
  }
}
