# 后台编辑器第一期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `/admin` 编辑器自动生成可读的拼音短链、不在正文重复显示文章标题，并在桌面分栏模式下按标题同步滚动编辑区与预览。

**Architecture:** 短链规则放进独立的服务端纯函数模块 `lib/slug.ts`，由 `importMarkdown` 调用，重名检查以谓词注入（`isSlugTaken` 在 `lib/published-storage.ts`）。标题去重与锚点在共用的 `renderMarkdown` 中完成，新增 `composeMarkdown` 把锚点行号换算到含 frontmatter 的原文。前端滚动映射是纯函数 `lib/scroll-sync.ts`，DOM 测量与事件放在 `components/admin/useScrollSync.ts`。

**Tech Stack:** Next.js 14 App Router、TypeScript、unified/remark/rehype、`pinyin-pro`（仅服务端）、Node 内置测试运行器（`npm test`）。

**Spec:** `docs/superpowers/specs/2026-11-01-admin-editor-phase1-design.md`

---

## 文件结构

| 文件 | 职责 | 动作 |
| --- | --- | --- |
| `lib/slug.ts` | 标题 → 拼音短链、截断、回退哈希、重名后缀、短链合法性 | 新建 |
| `lib/markdown.ts` | `importMarkdown` 短链/标题规则；`renderMarkdown` 去重标题与锚点；新增 `composeMarkdown` | 修改 |
| `lib/publishing-types.ts` | 新增 `HeadingAnchor` 类型 | 修改 |
| `lib/published-storage.ts` | 新增 `isSlugTaken` | 修改 |
| `app/api/admin/compose/route.ts`、`app/api/admin/import/route.ts` | 改用 `composeMarkdown`；compose 接受可选 `title` | 修改 |
| `lib/markdown-editor.ts` | 合并逻辑去掉占位文件名；草稿允许空文件名并兼容旧占位名 | 修改 |
| `lib/scroll-sync.ts` | 滚动位置映射纯函数 | 新建 |
| `components/admin/useScrollSync.ts` | 测量锚点、双向同步滚动 | 新建 |
| `components/admin/MarkdownEditor.tsx` | 分栏等高布局、同步开关、接入锚点 | 修改 |
| `components/admin/AdminWorkspace.tsx` | 不再生成占位文件名、标题驱动短链、地址预览、传锚点 | 修改 |
| `tests/slug.test.ts`、`tests/scroll-sync.test.ts` | 新单元测试 | 新建 |
| `tests/markdown.test.ts`、`tests/compose.test.ts`、`tests/markdown-editor.test.ts` | 更新旧断言、补充用例 | 修改 |
| `scripts/verify-publishing.mjs` | 集成验收补充拼音短链、锚点、单个 h1 | 修改 |
| `docs/markdown-publishing.md` | 更新短链、同步滚动与接口说明 | 修改 |

---

### Task 1: 分支、依赖与拼音核对

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: 开分支并提交设计文档与本计划**

```bash
git switch -c claude/admin-editor-phase1
git add docs/superpowers/specs/2026-11-01-admin-editor-phase1-design.md docs/superpowers/plans/2026-11-01-admin-editor-phase1.md
git commit -m "Add admin editor phase 1 design and plan"
```

- [ ] **Step 2: 安装 pinyin-pro**

Run: `npm install pinyin-pro@^3.29.5`
Expected: `package.json` 的 dependencies 出现 `"pinyin-pro": "^3.29.5"`。

- [ ] **Step 3: 核对测试将用到的拼音**

Run:
```bash
node --input-type=module -e 'import { pinyin } from "pinyin-pro"; for (const text of ["为什么管理者要远离微管理","导入文章","系统仿真入门","从工具到流程","与","绿色","我的笔记","粘贴的无线笔记","新标题","正文","草稿标题","从无线通信研发到海外市场产品能力"]) console.log(text, pinyin(text, { toneType: "none", type: "array" }).join(" "));'
```
Expected（逐行）：`wei shen me guan li zhe yao yuan li wei guan li`、`dao ru wen zhang`、`xi tong fang zhen ru men`、`cong gong ju dao liu cheng`、`yu`、`lü se`、`wo de bi ji`、`nian tie de wu xian bi ji`（库对“粘贴”的多音字取 nian）、`xin biao ti`、`zheng wen`、`cao gao biao ti`、`cong wu xian tong xin yan fa dao hai wai shi chang chan pin neng li`。若某个多音字结果不同，以实际输出为准修改后续任务中的期望值。

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json
git commit -m "Add pinyin-pro for readable article URLs"
```

---

### Task 2: 短链模块 `lib/slug.ts`

**Files:**
- Create: `lib/slug.ts`
- Test: `tests/slug.test.ts`

- [ ] **Step 1: 写失败的测试**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { automaticSlug, availableSlug, fallbackSlug, isUsableSlug, slugFromTitle } from "../lib/slug";

test("Chinese titles become toneless pinyin words", () => {
  assert.equal(slugFromTitle("为什么管理者要远离微管理"), "wei-shen-me-guan-li-zhe-yao-yuan-li-wei-guan-li");
  assert.equal(slugFromTitle("导入文章"), "dao-ru-wen-zhang");
});

test("Latin words and digits stay lowercase beside pinyin, and ü is written as v", () => {
  assert.equal(slugFromTitle("5G 系统仿真入门"), "5g-xi-tong-fang-zhen-ru-men");
  assert.equal(slugFromTitle("AI Coding：从工具到流程"), "ai-coding-cong-gong-ju-dao-liu-cheng");
  assert.equal(slugFromTitle("Ｗｉｆｉ 与 Café"), "wifi-yu-cafe");
  assert.equal(slugFromTitle("绿色"), "lv-se");
});

test("long titles are cut at a word boundary within 60 characters", () => {
  assert.equal(slugFromTitle("从无线通信研发到海外市场产品能力建设的六年复盘与方法总结"), "cong-wu-xian-tong-xin-yan-fa-dao-hai-wai-shi-chang-chan-pin");
  assert.equal(slugFromTitle("a".repeat(70)), "a".repeat(60));
});

test("titles without usable words fall back to a stable hash", () => {
  assert.equal(slugFromTitle("🎉🎉"), "");
  assert.equal(automaticSlug("🎉🎉"), fallbackSlug("🎉🎉"));
  assert.match(fallbackSlug("🎉🎉"), /^article-[a-f0-9]{16}$/);
  assert.match(automaticSlug("Constructor"), /^article-[a-f0-9]{16}$/);
  assert.equal(automaticSlug("导入文章"), "dao-ru-wen-zhang");
});

test("automatic URLs skip taken names with numeric suffixes", () => {
  const taken = new Set(["dao-ru-wen-zhang", "dao-ru-wen-zhang-2"]);
  assert.equal(availableSlug("dao-ru-wen-zhang", (slug) => taken.has(slug)), "dao-ru-wen-zhang-3");
  assert.equal(availableSlug("xin-wen-zhang", (slug) => taken.has(slug)), "xin-wen-zhang");
});

test("usable slugs follow the existing URL rules", () => {
  assert.ok(isUsableSlug("soc-architecture-basics"));
  for (const value of ["Hello World", "two--hyphens", "-edge", "constructor", "中文", "a".repeat(121)]) {
    assert.equal(isUsableSlug(value), false, value);
  }
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL，`tests/slug.test.ts` 报 `Cannot find module` / `ERR_MODULE_NOT_FOUND`（`lib/slug.ts` 尚不存在）。

- [ ] **Step 3: 实现 `lib/slug.ts`**

```ts
import "server-only";

import { createHash } from "node:crypto";
import { pinyin } from "pinyin-pro";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_SLUGS = new Set(["constructor", "prototype", "__proto__"]);
export const MAX_AUTOMATIC_SLUG_LENGTH = 60;
// CJK Unified Ideographs, Extension A and Compatibility Ideographs.
const HAN_RUN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g;

function asciiWords(text: string): string[] {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function truncate(slug: string): string {
  if (slug.length <= MAX_AUTOMATIC_SLUG_LENGTH) return slug;
  const boundary = slug.lastIndexOf("-", MAX_AUTOMATIC_SLUG_LENGTH);
  return (boundary > 0 ? slug.slice(0, boundary) : slug.slice(0, MAX_AUTOMATIC_SLUG_LENGTH)).replace(/-+$/, "");
}

/** Readable URL words: Chinese becomes toneless pinyin (ü as v); Latin letters and digits are kept. */
export function slugFromTitle(title: string): string {
  const words: string[] = [];
  let cursor = 0;
  for (const match of title.matchAll(HAN_RUN)) {
    const start = match.index ?? 0;
    words.push(...asciiWords(title.slice(cursor, start)));
    // Whole runs keep phrase context, so polyphonic characters read naturally.
    for (const syllable of pinyin(match[0], { toneType: "none", type: "array" })) {
      words.push(...asciiWords(syllable.replace(/ü/g, "v")));
    }
    cursor = start + match[0].length;
  }
  words.push(...asciiWords(title.slice(cursor)));
  return truncate(words.join("-"));
}

export function fallbackSlug(seed: string): string {
  return `article-${createHash("sha256").update(seed.normalize("NFKC").trim()).digest("hex").slice(0, 16)}`;
}

export function isUsableSlug(value: string): boolean {
  return value.length <= 120 && SLUG_PATTERN.test(value) && !RESERVED_SLUGS.has(value);
}

export function automaticSlug(title: string): string {
  const generated = slugFromTitle(title);
  return generated && isUsableSlug(generated) ? generated : fallbackSlug(title);
}

/** The first free URL among base, base-2, base-3 …; base itself if none is free. */
export function availableSlug(base: string, isTaken: (slug: string) => boolean): string {
  if (!isTaken(base)) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!isTaken(candidate)) return candidate;
  }
  return base;
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: `tests/slug.test.ts` 的 6 个用例 PASS，其余测试保持原状态。

- [ ] **Step 5: 提交**

```bash
git add lib/slug.ts tests/slug.test.ts
git commit -m "Generate pinyin slugs from article titles"
```

---

### Task 3: `importMarkdown` 的短链与标题规则

**Files:**
- Modify: `lib/markdown.ts`（imports；删除本地 `RESERVED_SLUGS` 与 `makeSlug`；`validateArticleMetadata` 的短链校验；`importMarkdown`）
- Test: `tests/markdown.test.ts`

- [ ] **Step 1: 更新旧断言并写新测试**

把 `tests/markdown.test.ts` 第 23–37 行的用例改为：

```ts
test("derives missing metadata and a pinyin slug from a Chinese title", () => {
  const source = "# 我的笔记\n\n摘要来自**第一段**，保留原意。\n\n## 章节\n内容。\n";
  const first = importMarkdown(source, "无线学习.md");
  const second = importMarkdown(source, "无线学习.md");
  assert.equal(first.content, source);
  assert.equal(first.metadata.title, "我的笔记");
  assert.equal(first.metadata.description, "摘要来自第一段，保留原意。");
  assert.equal(first.metadata.category, "未分类");
  assert.deepEqual(first.metadata.tags, []);
  assert.equal(first.metadata.featured, false);
  assert.equal(first.metadata.slug, "wo-de-bi-ji");
  assert.equal(first.metadata.slug, second.metadata.slug);
  const shanghai = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  assert.equal(first.metadata.date, shanghai);
});
```

在第 43 行（`uses an ASCII filename…` 用例）之后追加：

```ts
test("slugs prefer frontmatter, then a URL-shaped filename, then the title", () => {
  assert.equal(importMarkdown("---\nslug: chosen-url\n---\n# 标题\n\n正文。", "soc-architecture-basics.md").metadata.slug, "chosen-url");
  assert.equal(importMarkdown("# 系统仿真入门\n\n正文。", "soc-architecture-basics.md").metadata.slug, "soc-architecture-basics");
  assert.equal(importMarkdown("# 系统仿真入门\n\n正文。", "仿真笔记.md").metadata.slug, "xi-tong-fang-zhen-ru-men");
  assert.equal(importMarkdown("# 系统仿真入门\n\n正文。").metadata.slug, "xi-tong-fang-zhen-ru-men");
});

test("pasted prose without a title uses its first 30 characters, never a placeholder", () => {
  const imported = importMarkdown("这是一段没有标题的正文，用来测试粘贴时如何自动生成文章标题和文章地址。\n\n第二段。");
  assert.equal(imported.metadata.title, "这是一段没有标题的正文，用来测试粘贴时如何自动生成文章标题和");
  assert.ok(imported.metadata.slug.startsWith("zhe-shi-yi-duan"), imported.metadata.slug);
  assert.ok(imported.metadata.slug.length <= 60);
  assert.equal(importMarkdown("正文。").metadata.slug, "zheng-wen");
  assert.doesNotMatch(importMarkdown("正文。").metadata.slug, /pasted/);
});

test("an automatic URL follows the title typed in the editor and avoids taken names", () => {
  const taken = new Set(["xin-biao-ti"]);
  const imported = importMarkdown("# 原标题\n\n正文。", undefined, { slugTitle: "新标题", isSlugTaken: (slug) => taken.has(slug) });
  assert.equal(imported.metadata.title, "原标题");
  assert.equal(imported.metadata.slug, "xin-biao-ti-2");
  assert.ok(imported.warnings[0].includes("「xin-biao-ti」") && imported.warnings[0].includes("「xin-biao-ti-2」"));
  // Frontmatter is the author's explicit choice and is never renamed.
  const explicit = importMarkdown("---\nslug: xin-biao-ti\n---\n正文。", undefined, { isSlugTaken: (slug) => taken.has(slug) });
  assert.equal(explicit.metadata.slug, "xin-biao-ti");
  assert.ok(!explicit.warnings.some((warning) => warning.includes("已被其他文章使用")));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL：`wo-de-bi-ji` 断言失败（实际为 `article-…`），`importMarkdown("…")` 因缺少文件名抛出“只接受 UTF-8 编码的 .md 文件”。

- [ ] **Step 3: 修改 `lib/markdown.ts`**

3a. 在 imports 末尾加入：

```ts
import { automaticSlug, availableSlug, isUsableSlug, RESERVED_SLUGS, SLUG_PATTERN } from "./slug";
```

3b. 删除 `const RESERVED_SLUGS = new Set(["constructor", "prototype", "__proto__"]);` 这一行，以及整个 `function makeSlug(stem: string) { … }`。

3c. `validateArticleMetadata` 中的短链判断改为：

```ts
  if (typeof input.slug !== "string" || input.slug.length > 120 || !SLUG_PATTERN.test(input.slug) || RESERVED_SLUGS.has(input.slug)) {
```

3d. 在 `importMarkdown` 之前加入：

```ts
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
```

3e. 用下面的实现替换整个 `importMarkdown`（frontmatter 解析部分与原来逐字相同）：

```ts
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
```

（原来的“已根据文件名生成稳定英文短链”提醒随文件名短链规则一起删除。）

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: `tests/markdown.test.ts` 全部 PASS；`tests/compose.test.ts` 中 `pasted-article` 断言仍失败（Task 5 处理）。

- [ ] **Step 5: 提交**

```bash
git add lib/markdown.ts tests/markdown.test.ts
git commit -m "Derive article URLs from titles instead of placeholder filenames"
```

---

### Task 4: `renderMarkdown` 去重标题与标题锚点

**Files:**
- Modify: `lib/publishing-types.ts`, `lib/markdown.ts`（`renderMarkdown` 及新插件）
- Test: `tests/markdown.test.ts`

- [ ] **Step 1: 写失败的测试**（追加到 `tests/markdown.test.ts` 末尾）

```ts
test("a leading H1 is not rendered and later H1s become H2 headings", async () => {
  const { html, toc } = await renderMarkdown("# 文章标题\n\n导语。\n\n# 第一部分\n\n## 小节\n");
  assert.doesNotMatch(html, /<h1|文章标题/);
  assert.match(html, /<h2[^>]*>第一部分<\/h2>/);
  assert.deepEqual(toc.map((item) => [item.text, item.depth]), [["第一部分", 2], ["小节", 2]]);
});

test("anchors map each rendered heading to its source line", async () => {
  const { html, anchors } = await renderMarkdown("# 标题\n\n导语。\n\n## 第一节\n\n```md\n# 代码里的井号\n```\n\n### 小节\n");
  assert.deepEqual(anchors.map((anchor) => anchor.line), [5, 11]);
  for (const anchor of anchors) assert.ok(html.includes(`id="${anchor.id}"`), anchor.id);
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL：HTML 中仍有 `<h1`；`anchors` 为 `undefined`（`Cannot read properties of undefined (reading 'map')`）。

- [ ] **Step 3: 实现**

3a. `lib/publishing-types.ts` 末尾追加：

```ts
/** A rendered heading and the 1-based source line it came from. */
export type HeadingAnchor = { id: string; line: number };
```

3b. `lib/markdown.ts` 的类型导入改为：

```ts
import type { ArticleMetadata, HeadingAnchor, ImportedMarkdown } from "./publishing-types";
```

3c. 在 `safeUrls` 之前加入：

```ts
/** The article page already shows its title: drop a leading H1 and keep other headings below it. */
function articleHeadings() {
  return (tree: MarkdownRoot) => {
    const first = tree.children.findIndex((node) => node.type !== "html" && node.type !== "definition");
    const lead = tree.children[first];
    if (lead?.type === "heading" && lead.depth === 1) tree.children.splice(first, 1);
    visit(tree, "heading", (node) => { if (node.depth === 1) node.depth = 2; });
  };
}
```

3d. 用下面的实现替换整个 `renderMarkdown`：

```ts
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
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: 两个新用例 PASS；原有渲染与安全用例保持 PASS。

- [ ] **Step 5: 提交**

```bash
git add lib/publishing-types.ts lib/markdown.ts tests/markdown.test.ts
git commit -m "Render article headings once and report their source lines"
```

---

### Task 5: `composeMarkdown`、重名检查与接口

**Files:**
- Modify: `lib/markdown.ts`（新增 `composeMarkdown`）、`lib/published-storage.ts`（新增 `isSlugTaken`）、`app/api/admin/compose/route.ts`、`app/api/admin/import/route.ts`
- Test: `tests/markdown.test.ts`, `tests/compose.test.ts`

- [ ] **Step 1: 写失败的测试**

`tests/markdown.test.ts` 第 3 行 import 改为：

```ts
import { composeMarkdown, importMarkdown, MarkdownValidationError, renderMarkdown, validateArticleMetadata } from "../lib/markdown";
```

并追加：

```ts
test("composed anchors count lines in the full pasted source", async () => {
  const composed = await composeMarkdown("---\ntitle: 标题\n---\n# 标题\n\n## 第一节\n");
  assert.deepEqual(composed.anchors.map((anchor) => anchor.line), [6]);
  assert.ok(composed.html.includes(`id="${composed.anchors[0].id}"`));
});
```

`tests/compose.test.ts` 第 73 行改为：

```ts
  assert.equal(result.metadata.slug, "nian-tie-de-wu-xian-bi-ji");
  assert.deepEqual(result.anchors.map((anchor: { line: number }) => anchor.line), [5]);
```

并在文件末尾追加：

```ts
test("automatic URLs follow an edited title and skip URLs used by repository articles", async () => {
  const response = await compose(request({ source: "# 草稿标题\n\n正文。", title: "Understanding System Simulation" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.metadata.title, "草稿标题");
  assert.equal(result.metadata.slug, "understanding-system-simulation-2");
  assert.ok(result.warnings.some((warning: string) => warning.includes("understanding-system-simulation-2")));
  for (const title of [42, null, {}, "标".repeat(201)]) {
    assert.equal((await compose(request({ source: "# 标题", title }))).status, 400);
  }
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL：`composeMarkdown is not a function`；compose 响应没有 `anchors`、短链为 `pasted-article`。

- [ ] **Step 3: 实现**

3a. `lib/markdown.ts` 文件末尾追加：

```ts
export type ComposedMarkdown = ImportedMarkdown & { html: string; toc: TocItem[]; anchors: HeadingAnchor[] };

/** Parses pasted or uploaded source and renders its preview; anchor lines refer to the full source. */
export async function composeMarkdown(source: string, filename?: string, options: ImportOptions = {}): Promise<ComposedMarkdown> {
  const imported = importMarkdown(source, filename, options);
  const rendered = await renderMarkdown(imported.content);
  // The body is always a suffix of the source, after an optional BOM and frontmatter.
  const lineOffset = source.slice(0, source.length - imported.content.length).split("\n").length - 1;
  return { ...imported, ...rendered, anchors: rendered.anchors.map((anchor) => ({ ...anchor, line: anchor.line + lineOffset })) };
}
```

3b. `lib/published-storage.ts` 在 `getPublishedFiles` 之后追加：

```ts
/** True when a repository MDX file (including drafts) or a stored article owns this URL. */
export function isSlugTaken(slug: string): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (fs.existsSync(path.join(process.cwd(), "content", "blog", `${slug}.mdx`))) return true;
  const directory = getContentDirectory();
  return directory !== null && fs.existsSync(path.join(directory, `${slug}.md`));
}
```

3c. `app/api/admin/compose/route.ts` 全文替换为：

```ts
import { composeMarkdown } from "@/lib/markdown";
import { isSlugTaken, PublishingError } from "@/lib/published-storage";
import { authorizePublishing, publishingErrorResponse, publishingResponse, readPublishingJson, validateMarkdownBody } from "@/lib/publishing-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function optionalText(value: unknown, maxLength: number, message: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || Array.from(value).length > maxLength) throw new PublishingError(message);
  return value;
}

export async function POST(request: Request) {
  try {
    authorizePublishing(request);
    const body = await readPublishingJson(request);
    validateMarkdownBody(body.source);
    const filename = optionalText(body.filename, 255, "文章来源名称必须是有效的 .md 文件名，最长 255 字符。");
    // A title the author typed only steers the automatic URL; it is never stored here.
    const title = optionalText(body.title, 200, "标题必须是文本，且不能超过 200 个字符。");
    // Parsing and preview are intentionally independent of publication/storage.
    return publishingResponse(await composeMarkdown(body.source, filename, { slugTitle: title, isSlugTaken }));
  } catch (error) {
    return publishingErrorResponse(error);
  }
}
```

3d. `app/api/admin/import/route.ts`：第 1 行 import 改为

```ts
import { composeMarkdown } from "@/lib/markdown";
import { isSlugTaken, PublishingError } from "@/lib/published-storage";
```

（删除原第 2 行 `import { PublishingError } from "@/lib/published-storage";`），并把第 24–26 行替换为：

```ts
    return publishingResponse(await composeMarkdown(decodeUtf8(new Uint8Array(await file.arrayBuffer())), file.name, { isSlugTaken }));
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: 全部 PASS（compose 的 afterEach 仍确认临时目录为空）。

- [ ] **Step 5: 提交**

```bash
git add lib/markdown.ts lib/published-storage.ts app/api/admin/compose/route.ts app/api/admin/import/route.ts tests/markdown.test.ts tests/compose.test.ts
git commit -m "Return heading anchors and collision-free URLs from compose"
```

---

### Task 6: 编辑器合并逻辑与草稿文件名

**Files:**
- Modify: `lib/markdown-editor.ts`
- Test: `tests/markdown-editor.test.ts`

- [ ] **Step 1: 更新测试**

第 14 行改为：

```ts
  const result = mergeComposedMetadata(current, derived, new Set(["title", "category", "tags", "slug"]));
```

第 23–29 行的用例替换为：

```ts
test("untouched fields follow each composition while manual edits win", () => {
  const derived = { ...emptyArticleMetadata("2026-11-01"), title: "首段前三十个字", description: "首段前三十个字。", slug: "shou-duan-qian-san-shi-ge-zi" };
  assert.deepEqual(mergeComposedMetadata(emptyArticleMetadata("2026-11-01"), derived, new Set()), derived);
  const edited = mergeComposedMetadata({ ...derived, title: "手动标题" }, { ...derived, slug: "shou-dong-biao-ti" }, new Set(["title"]));
  assert.equal(edited.title, "手动标题");
  assert.equal(edited.slug, "shou-dong-biao-ti");
});

test("pasted drafts have no filename, including drafts saved with the old placeholder", () => {
  const base = { version: 1, source: "# 标题\n\n正文。", metadata: emptyArticleMetadata("2026-11-01"), editedFields: [], savedAt: Date.now() };
  assert.equal(readEditorDraft(JSON.stringify({ ...base, filename: "" }))?.filename, "");
  assert.equal(readEditorDraft(JSON.stringify({ ...base, filename: "pasted-0f8fad5b-d9cb-469f-a165-70867728950e.md" }))?.filename, "");
  assert.equal(readEditorDraft(JSON.stringify({ ...base, filename: "无线学习.md" }))?.filename, "无线学习.md");
  assert.equal(readEditorDraft(JSON.stringify({ ...base, filename: "../bad.md" })), null);
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL：空文件名草稿返回 `null`；旧占位名未被清空。（类型检查会在 Step 3 后通过。）

- [ ] **Step 3: 实现 `lib/markdown-editor.ts`**

3a. `EditorDraft` 中 `filename: string;` 改为：

```ts
  /** The uploaded file's name; empty for pasted text. */
  filename: string;
```

3b. 在 `EditorDraft` 类型之后加入：

```ts
// Drafts saved before pasted text was composed without a filename stored this placeholder.
const LEGACY_PASTED_FILENAME = /^pasted-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/i;
```

3c. `mergeComposedMetadata` 替换为：

```ts
/** Only untouched fields follow the pasted Markdown; manual edits always win. */
export function mergeComposedMetadata(current: ArticleMetadata, derived: ArticleMetadata, edited: ReadonlySet<MetadataField>): ArticleMetadata {
  return Object.fromEntries(metadataFields.map((field) => [field, edited.has(field) ? current[field] : derived[field]])) as ArticleMetadata;
}
```

3d. `readEditorDraft` 中文件名校验
`typeof draft.filename !== "string" || !/\.md$/i.test(draft.filename) || /[\\/\u0000-\u001f]/.test(draft.filename) ||`
改为：

```ts
      typeof draft.filename !== "string" || (draft.filename !== "" && (!/\.md$/i.test(draft.filename) || /[\\/\u0000-\u001f]/.test(draft.filename))) ||
```

返回语句改为：

```ts
    return { ...draft, filename: LEGACY_PASTED_FILENAME.test(draft.filename) ? "" : draft.filename, metadata: { ...metadata }, editedFields: [...draft.editedFields] };
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: `tests/markdown-editor.test.ts` 全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add lib/markdown-editor.ts tests/markdown-editor.test.ts
git commit -m "Stop treating pasted drafts as named files"
```

---

### Task 7: 滚动映射纯函数

**Files:**
- Create: `lib/scroll-sync.ts`
- Test: `tests/scroll-sync.test.ts`

- [ ] **Step 1: 写失败的测试**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { mapScrollPosition } from "../lib/scroll-sync";

test("without anchors the panes scroll proportionally", () => {
  assert.equal(mapScrollPosition(50, [], 100, 300), 150);
});

test("anchors align exactly and positions between them are interpolated", () => {
  const anchors = [{ from: 40, to: 200 }];
  assert.equal(mapScrollPosition(40, anchors, 100, 300), 200);
  assert.equal(mapScrollPosition(20, anchors, 100, 300), 100);
  assert.equal(mapScrollPosition(70, anchors, 100, 300), 250);
});

test("both ends always align and positions are clamped", () => {
  assert.equal(mapScrollPosition(-10, [{ from: 40, to: 200 }], 100, 300), 0);
  assert.equal(mapScrollPosition(150, [{ from: 40, to: 200 }], 100, 300), 300);
  assert.equal(mapScrollPosition(10, [], 0, 300), 0);
});

test("anchors that run backwards, repeat or fall outside the panes are ignored without throwing", () => {
  const anchors = [{ from: Number.NaN, to: 5 }, { from: 60, to: 100 }, { from: 40, to: 210 }, { from: 40, to: 200 }, { from: 90, to: 900 }];
  let previous = -1;
  for (let position = 0; position <= 100; position += 5) {
    const mapped = mapScrollPosition(position, anchors, 100, 300);
    assert.ok(mapped >= previous && mapped >= 0 && mapped <= 300, `${position} -> ${mapped}`);
    previous = mapped;
  }
  assert.equal(mapScrollPosition(40, anchors, 100, 300), 200);
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL，找不到 `lib/scroll-sync`。

- [ ] **Step 3: 实现 `lib/scroll-sync.ts`**

```ts
/** Matching scroll offsets in two panes, such as one heading's position in each. */
export type ScrollAnchor = { from: number; to: number };

/**
 * Maps a scroll offset from one pane to the other. Anchor pairs align exactly,
 * offsets between them are interpolated, and both pane ends always align.
 */
export function mapScrollPosition(position: number, anchors: readonly ScrollAnchor[], fromMax: number, toMax: number): number {
  if (!(fromMax > 0) || !(toMax > 0)) return 0;
  const points: ScrollAnchor[] = [{ from: 0, to: 0 }];
  // Filter before sorting: comparisons with NaN would leave the order undefined.
  const candidates = anchors.filter((anchor) => Number.isFinite(anchor.from) && Number.isFinite(anchor.to))
    .sort((a, b) => a.from - b.from || a.to - b.to);
  for (const anchor of candidates) {
    const last = points[points.length - 1];
    // Keep the mapping monotonic and inside both panes.
    if (anchor.from <= last.from || anchor.to < last.to || anchor.from >= fromMax || anchor.to > toMax) continue;
    points.push(anchor);
  }
  points.push({ from: fromMax, to: toMax });
  const clamped = Math.min(Math.max(position, 0), fromMax);
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    if (clamped <= end.from) {
      const span = end.from - start.from;
      const ratio = span > 0 ? (clamped - start.from) / span : 0;
      return Math.min(Math.max(start.to + ratio * (end.to - start.to), 0), toMax);
    }
  }
  return toMax;
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: `tests/scroll-sync.test.ts` 4 个用例 PASS。

- [ ] **Step 5: 提交**

```bash
git add lib/scroll-sync.ts tests/scroll-sync.test.ts
git commit -m "Map scroll positions between editor and preview by anchors"
```

---

### Task 8: 同步滚动 Hook 与分栏布局

**Files:**
- Create: `components/admin/useScrollSync.ts`
- Modify: `components/admin/MarkdownEditor.tsx`

- [ ] **Step 1: 新建 `components/admin/useScrollSync.ts`**

```ts
"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { HeadingAnchor } from "@/lib/publishing-types";
import { mapScrollPosition, type ScrollAnchor } from "@/lib/scroll-sync";

const MIRRORED_STYLES = [
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontFamily", "fontSize", "fontWeight", "fontStyle",
  "fontVariantLigatures", "letterSpacing", "lineHeight", "tabSize", "textIndent", "textTransform", "wordSpacing",
  "wordBreak", "overflowWrap", "whiteSpace"
] as const;

/** Offsets of 1-based source lines inside a textarea, measured on a hidden copy of its text. */
function measureEditorLines(textarea: HTMLTextAreaElement, lines: number[]) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  for (const property of MIRRORED_STYLES) mirror.style[property] = style[property];
  Object.assign(mirror.style, {
    position: "absolute", top: "0", left: "-10000px", visibility: "hidden", overflow: "hidden",
    height: "auto", boxSizing: "border-box", borderWidth: "0", width: `${textarea.clientWidth}px`
  });
  const wanted = new Set(lines);
  const markers = new Map<number, HTMLSpanElement>();
  textarea.value.split("\n").forEach((text, index) => {
    if (wanted.has(index + 1)) {
      const marker = document.createElement("span");
      markers.set(index + 1, marker);
      mirror.append(marker);
    }
    mirror.append(document.createTextNode(`${text}\n`));
  });
  document.body.append(mirror);
  const offsets = new Map<number, number>();
  for (const [line, marker] of markers) offsets.set(line, marker.offsetTop);
  mirror.remove();
  return offsets;
}

function measurePreviewHeadings(container: HTMLElement, ids: string[]) {
  const top = container.getBoundingClientRect().top - container.scrollTop;
  const offsets = new Map<string, number>();
  for (const id of ids) {
    const heading = container.querySelector(`#${CSS.escape(id)}`);
    if (heading) offsets.set(id, heading.getBoundingClientRect().top - top);
  }
  return offsets;
}

function measureAnchors(textarea: HTMLTextAreaElement, preview: HTMLElement, anchors: HeadingAnchor[]): ScrollAnchor[] {
  const lines = measureEditorLines(textarea, anchors.map((anchor) => anchor.line));
  const headings = measurePreviewHeadings(preview, anchors.map((anchor) => anchor.id));
  return anchors.flatMap(({ id, line }) => {
    const from = lines.get(line);
    const to = headings.get(id);
    return from === undefined || to === undefined ? [] : [{ from, to }];
  });
}

/**
 * Keeps the Markdown textarea and the preview pane on the same section while
 * enabled. Headings are paired by their source line and rendered id.
 */
export function useScrollSync(editorRef: RefObject<HTMLTextAreaElement>, previewRef: RefObject<HTMLElement>, anchors: HeadingAnchor[], enabled: boolean, contentKey: string) {
  const pairs = useRef<ScrollAnchor[]>([]);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!enabled || !editor || !preview) return;
    let leader: "editor" | "preview" | null = null;
    let frame = 0;
    let measureTimer = 0;
    let releaseTimer = 0;
    const measure = () => { pairs.current = measureAnchors(editor, preview, anchors); };
    const scheduleMeasure = () => { window.clearTimeout(measureTimer); measureTimer = window.setTimeout(measure, 120); };
    const follow = (source: "editor" | "preview") => () => {
      // The pane we just scrolled programmatically must not lead in turn.
      if (leader !== null && leader !== source) return;
      leader = source;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const from = source === "editor" ? editor : preview;
        const to = source === "editor" ? preview : editor;
        const mapping = source === "editor" ? pairs.current : pairs.current.map(({ from: start, to: end }) => ({ from: end, to: start }));
        to.scrollTop = mapScrollPosition(from.scrollTop, mapping, from.scrollHeight - from.clientHeight, to.scrollHeight - to.clientHeight);
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(() => { leader = null; }, 120);
      });
    };
    const followEditor = follow("editor");
    const followPreview = follow("preview");
    measure();
    followEditor();
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(editor);
    resize.observe(preview);
    if (preview.firstElementChild) resize.observe(preview.firstElementChild);
    editor.addEventListener("scroll", followEditor, { passive: true });
    preview.addEventListener("scroll", followPreview, { passive: true });
    return () => {
      resize.disconnect();
      editor.removeEventListener("scroll", followEditor);
      preview.removeEventListener("scroll", followPreview);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(measureTimer);
      window.clearTimeout(releaseTimer);
    };
  }, [editorRef, previewRef, anchors, enabled, contentKey]);
}
```

- [ ] **Step 2: 修改 `components/admin/MarkdownEditor.tsx`**

2a. 第 3–6 行 imports 替换为：

```tsx
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Bold, Code2, Columns2, Eye, FileCode2, Heading2, Italic, Link2, List, Loader2, Quote, Table2 } from "lucide-react";
import { useScrollSync } from "@/components/admin/useScrollSync";
import { applyMarkdownEdit, type MarkdownAction } from "@/lib/markdown-editor";
import type { ArticleMetadata, HeadingAnchor } from "@/lib/publishing-types";

const SCROLL_SYNC_KEY = "xiang-fuxing-blog-editor-scroll-sync-v1";
const WIDE_SCREEN = "(min-width: 1024px)";
```

2b. 组件签名与开头状态（原第 19–25 行）替换为：

```tsx
export function MarkdownEditor({ source, onChange, html, anchors, metadata, loading, current, disabled, error }: {
  source: string; onChange: (source: string) => void; html: string; anchors: HeadingAnchor[]; metadata: ArticleMetadata;
  loading: boolean; current: boolean; disabled: boolean; error: string;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const previewPane = useRef<HTMLDivElement>(null);
  const escapeTab = useRef(false);
  const [view, setView] = useState<"split" | "write" | "preview">("split");
  const [syncScroll, setSyncScroll] = useState(true);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    try { setSyncScroll(window.localStorage.getItem(SCROLL_SYNC_KEY) !== "off"); } catch { /* Keep the default. */ }
    const query = window.matchMedia(WIDE_SCREEN);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Side-by-side panes exist only in split view on wide screens.
  const paired = view === "split" && wide;
  useScrollSync(textarea, previewPane, anchors, paired && syncScroll && !!html, html);

  function toggleScrollSync() {
    const next = !syncScroll;
    setSyncScroll(next);
    try { window.localStorage.setItem(SCROLL_SYNC_KEY, next ? "on" : "off"); } catch { /* The choice still applies on this page. */ }
  }
```

2c. 工具栏中字数统计 `<span className="ml-auto …">` 之前插入：

```tsx
        {view === "split" ? (
          <button type="button" aria-pressed={syncScroll} onClick={toggleScrollSync} title="编辑区与预览按标题同步滚动" className={`hidden min-h-10 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:inline-flex ${syncScroll ? "bg-accent-soft text-accent" : "text-secondary hover:text-accent"}`}>
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />同步滚动
          </button>
        ) : null}
```

2d. 原第 52–76 行（分栏网格到结尾 `</div>`）替换为：

```tsx
      <div className={view === "split" ? "grid min-w-0 lg:h-[max(480px,calc(100vh_-_13rem))] lg:grid-cols-2" : "min-w-0"}>
        {view !== "preview" ? (
          <div className={`min-w-0 ${view === "split" ? "border-b border-border lg:h-full lg:border-b-0 lg:border-r" : ""}`}>
            <label htmlFor="article-content" className="sr-only">Markdown 正文</label>
            <textarea ref={textarea} id="article-content" name="content" aria-label="Markdown 正文" value={source} onChange={(event) => onChange(event.target.value)} disabled={disabled} spellCheck={false} placeholder={"# 在这里粘贴文章标题\n\n把 Markdown 正文直接粘贴到这里，右侧会自动显示预览。\n\n## 小标题\n\n支持 **加粗**、列表、表格、代码和数学公式。"} onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") { escapeTab.current = true; return; }
              if (event.key === "Tab" && escapeTab.current) { escapeTab.current = false; return; }
              escapeTab.current = false;
              if ((event.metaKey || event.ctrlKey) && ["b", "i", "k"].includes(event.key.toLowerCase())) {
                event.preventDefault(); insert(({ b: "bold", i: "italic", k: "link" } as const)[event.key.toLowerCase() as "b" | "i" | "k"]);
              } else if (event.key === "Tab") { event.preventDefault(); insert(event.shiftKey ? "outdent" : "indent"); }
            }} className={`block min-h-[460px] w-full resize-y border-0 bg-bg p-5 font-mono text-[14px] leading-7 text-primary outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-inset focus:ring-accent disabled:opacity-70 ${view === "split" ? "lg:h-full lg:min-h-0 lg:resize-none" : "lg:min-h-[600px]"}`} />
          </div>
        ) : null}
        {view !== "write" ? (
          <div className={`min-w-0 bg-surface ${view === "split" ? "lg:flex lg:h-full lg:min-h-0 lg:flex-col" : ""}`}>
            <div className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-2 text-xs text-muted" role="status">
              <span>阅读预览</span><span className="inline-flex items-center gap-1.5">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}{loading ? "正在更新…" : current ? "预览已更新" : source.trim() ? "等待更新" : "等待粘贴正文"}</span>
            </div>
            {error ? <p role="alert" className="m-4 shrink-0 rounded-md bg-red-50 p-3 text-sm leading-6 text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
            <div ref={previewPane} className={view === "split" ? "min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" : "min-w-0"}>
              {html ? <article className="min-w-0 px-5 py-6 sm:px-7"><header className="mb-6 border-b border-border pb-5"><p className="text-xs text-muted">{metadata.category} · {metadata.date}</p><h2 className="mt-3 break-words text-2xl font-semibold leading-tight">{metadata.title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{metadata.description}</p></header><div className="markdown-body article-content prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} /></article> : <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-12 text-center text-muted"><Eye className="h-9 w-9 opacity-40" aria-hidden="true" /><p className="text-sm leading-7">粘贴 Markdown 后自动生成安全预览。<br />预览和编辑都不会公开文章。</p></div>}
            </div>
          </div>
        ) : null}
      </div>
```

- [ ] **Step 3: 类型检查**

Run: `npm run type-check`
Expected: 仅 `components/admin/AdminWorkspace.tsx` 报 `Property 'anchors' is missing`（Task 9 处理），其余无错误。

- [ ] **Step 4: 提交**（与 Task 9 一起提交，保证每个提交都能通过类型检查）

---

### Task 9: AdminWorkspace 接线

**Files:**
- Modify: `components/admin/AdminWorkspace.tsx`

- [ ] **Step 1: imports 与类型**

第 7 行改为：

```tsx
import type { ArticleMetadata, HeadingAnchor } from "@/lib/publishing-types";
```

第 9 行之后加入：

```tsx
import { siteConfig } from "@/lib/site";
```

`type ImportResponse` 中 `html: string;` 之后加入：

```tsx
  anchors?: HeadingAnchor[];
```

`const secondaryButtonClass = …;` 之后加入：

```tsx
const NO_ANCHORS: HeadingAnchor[] = [];
const siteHost = siteConfig.siteUrl.replace(/^https?:\/\//, "");
```

- [ ] **Step 2: 不再生成占位文件名**

初始化 effect 中删除：

```tsx
    } else {
      setFilename(`pasted-${crypto.randomUUID()}.md`);
    }
```

（保留 `if (draft) { … }` 的右花括号。）`newArticle` 中 `setFilename(`pasted-${crypto.randomUUID()}.md`);` 改为 `setFilename("");`。

- [ ] **Step 3: 合并与 compose 请求**

`applyComposition` 替换为：

```tsx
  const applyComposition = useCallback((data: ImportResponse, forRevision: number) => {
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
```

`compose` 替换为：

```tsx
  const compose = useCallback(async (raw: string, forRevision: number, forFilename: string, controller: AbortController) => {
    // A title typed by the author decides the automatic URL.
    const title = editedFields.current.has("title") ? metadataRef.current.title.trim() : "";
    const result = await readResponse<ImportResponse>(await fetch("/api/admin/compose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: raw, ...(forFilename ? { filename: forFilename } : {}), ...(title ? { title } : {}) }), signal: controller.signal
    }));
    if (controller.signal.aborted) return null;
    return applyComposition(result, forRevision);
  }, [applyComposition]);
```

自动预览 effect 的守卫改为（去掉 `!filename`，粘贴内容的文件名为空）：

```tsx
    if (!ready || !source.trim() || published || previewRef.current?.revision === revision) return;
```

`importFile` 中 `applyComposition(result, currentRevision, file.name);` 改为 `applyComposition(result, currentRevision);`。

- [ ] **Step 4: 标题驱动短链、清空短链恢复自动**

`updateMetadata` 替换为：

```tsx
  function requestComposition() {
    revisionRef.current += 1;
    setRevision(revisionRef.current);
  }

  function updateMetadata<K extends MetadataField>(field: K, value: ArticleMetadata[K]) {
    editedFields.current.add(field);
    // Clearing the URL hands it back to automatic generation.
    if (field === "slug" && value === "") editedFields.current.delete("slug");
    commitMetadata({ ...metadataRef.current, [field]: value });
    markChanged();
    // An automatic URL follows the title the author settles on.
    if ((field === "title" || field === "slug") && !editedFields.current.has("slug") && source.trim()) requestComposition();
  }
```

- [ ] **Step 5: 地址预览与锚点**

文章地址输入框的 `placeholder="自动生成，可自定义"` 改为 `placeholder="留空则根据标题自动生成"`，并在该 `<input … />` 之后、`</label>` 之前插入：

```tsx
<span className="mt-1 block break-all text-xs font-normal text-muted">发布后地址：{siteHost}/blog/{metadata.slug || "…"}</span>
```

`<MarkdownEditor … />` 加上 `anchors={preview?.data.anchors ?? NO_ANCHORS}`。

- [ ] **Step 6: 检查**

Run: `npm run type-check && npm run lint && npm test`
Expected: 无类型或 lint 错误，测试全部 PASS。

- [ ] **Step 7: 提交 Task 8 与 Task 9**

```bash
git add components/admin/useScrollSync.ts components/admin/MarkdownEditor.tsx components/admin/AdminWorkspace.tsx
git commit -m "Sync editor and preview scrolling and show the article URL"
```

---

### Task 10: 集成验收与文档

**Files:**
- Modify: `scripts/verify-publishing.mjs`, `docs/markdown-publishing.md`

- [ ] **Step 1: 集成脚本**

`verifyPublic` 中 `status(detail, 200, "公开详情");` 之后加入：

```js
  ensure((detail.body.match(/<h1[\s>]/g) ?? []).length === 1, "公开详情页重复显示了文章标题");
```

把
`ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plainArticle.metadata.slug), "未提供文件名时没有生成有效文章地址");`
替换为：

```js
    ensure(plainArticle.metadata.slug === "dao-ru-wen-zhang", "粘贴中文标题没有生成拼音文章地址");
```

在 `ensure(plainArticle.toc.some((item) => item.text === "阅读结构"), "粘贴没有返回阅读目录");` 之后加入：

```js
    ensure(plainArticle.anchors?.[0]?.line === 5 && plainArticle.html.includes(`id="${plainArticle.anchors[0].id}"`), "粘贴预览没有返回可对齐的标题位置");
```

- [ ] **Step 2: 文档 `docs/markdown-publishing.md`**

第 11 行末尾追加：`文章地址默认由标题生成：中文转为拼音，英文转为小写加连字符，最长 60 字符；与已有文章重名时自动加 -2、-3 并提醒确认；清空地址即恢复自动生成。`

第 12 行末尾追加：`宽屏分栏时编辑区与预览按标题同步滚动，可在工具栏关闭“同步滚动”。正文开头的一级标题不会在文章页重复显示。`

第 16 行中 `中文文件名会得到稳定的 ASCII 短链，可在发布前修改。` 替换为：`文件名本身是合法短链（如 my-article.md）时沿用文件名，否则按标题生成拼音短链，可在发布前修改。`

第 24 行替换为：`编辑器通过 POST /api/admin/compose 发送 JSON：{ source, filename?, title? }，source 为完整 Markdown 文本；filename 只在导入文件时提供；title 是编辑器中手动修改的标题，只用于生成自动地址。接口返回 { content, metadata, warnings, html, toc, anchors }，anchors 为各标题在原文中的行号，用于同步滚动；这一步不会写入公开文章。`

- [ ] **Step 3: 提交**

```bash
git add scripts/verify-publishing.mjs docs/markdown-publishing.md
git commit -m "Cover pinyin URLs, heading anchors and single titles in acceptance"
```

---

### Task 11: 全量验证与浏览器检查

- [ ] **Step 1: 停止正在运行的开发服务器**（`next build` 会覆盖 `.next`）

- [ ] **Step 2: 依次运行**

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run test:integration
```

Expected: 全部成功；集成脚本最后一行 `PASS 全部生产集成验收完成`。

- [ ] **Step 3: 浏览器检查**（`npm run dev`，登录 `/admin`，口令见 `.env.local` 注释）
  - 粘贴以 `# 为什么管理者要远离微管理` 开头的文章：地址为 `wei-shen-me-guan-li-zhe-yao-yuan-li-wei-guan-li`，下方显示完整网址。
  - 手动把标题改成“新标题”：地址变为 `xin-biao-ti`；清空地址后恢复自动。
  - 预览只显示一次标题。
  - 1280px 宽度分栏：滚动编辑区到 `## 三、…`，预览对齐到同一标题；反向滚动预览，编辑区跟随；关闭“同步滚动”后不再联动。
  - 375px 宽度：编辑/预览切换正常，无同步开关。

- [ ] **Step 4: 确认分支提交完整，不推送**

```bash
git status --short
git log --oneline main..HEAD
```
