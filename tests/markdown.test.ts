import assert from "node:assert/strict";
import test from "node:test";
import { importMarkdown, MarkdownValidationError, renderMarkdown, validateArticleMetadata } from "../lib/markdown";

const validMetadata = {
  title: "测试文章",
  description: "未经 AI 改写的摘要。",
  date: "2026-11-01",
  category: "无线通信",
  tags: ["5G"],
  featured: false,
  slug: "a-new-article"
};

test("imports frontmatter without rewriting the Markdown body", () => {
  const content = "\r\n# 原始标题\r\n\r\n这段正文保留  两个空格。\r\n\r\n```js\r\nconst answer = 42;\r\n```\r\n";
  const source = "\uFEFF---\r\ntitle: 测试文章\r\ndescription: 未经 AI 改写的摘要。\r\ndate: 2026-11-01\r\ncategory: 无线通信\r\ntags: [5G]\r\nfeatured: false\r\nslug: a-new-article\r\n---\r\n" + content;
  const imported = importMarkdown(source, "notes.md");
  assert.equal(imported.content, content);
  assert.deepEqual(imported.metadata, validMetadata);
});

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

test("uses an ASCII filename as title and slug when no H1 is present", () => {
  const imported = importMarkdown("一段正文。", "Hello World.MD");
  assert.equal(imported.metadata.title, "Hello World");
  assert.equal(imported.metadata.slug, "hello-world");
});

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

test("imports valid dates preferentially and falls back to Shanghai today for invalid dates", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const valid = importMarkdown("---\ndate: 2024-02-29\n---\n# 标题\n\n正文。", "date.md");
  assert.equal(valid.metadata.date, "2024-02-29");
  assert.ok(!valid.warnings.some((warning) => warning.includes("日期无效")));
  for (const date of ["2026-02-29", "not-a-date", "2026-1-01", "true", "null", "[2026]", "''"]) {
    const imported = importMarkdown(`---\ndate: ${date}\n---\n# 标题\n\n正文。`, "date.md");
    assert.equal(imported.metadata.date, today);
    assert.ok(imported.warnings.some((warning) => warning.includes("日期无效") && warning.includes(today)));
  }
  assert.throws(() => validateArticleMetadata({ ...validMetadata, date: "2026-02-29" }), /日期/);
});

test("rejects executable YAML and malformed metadata instead of evaluating them", () => {
  for (const source of [
    "---js\n({title: process.exit()})\n---\n正文",
    "---\ntitle: !!js/function 'function(){ return 1; }'\n---\n正文",
    "---\ntitle: 一个\ntitle: 两个\n---\n正文",
    "---\n- title\n- value\n---\n正文",
    "---\ntitle: 标题\n正文"
  ]) {
    assert.throws(() => importMarkdown(source, "note.md"), MarkdownValidationError);
  }
  assert.throws(() => importMarkdown("---\ntags: hello\n---\n正文", "note.md"), /标签/);
  assert.throws(() => importMarkdown("---\nfeatured: 'false'\n---\n正文", "note.md"), /featured/);
});

test("requires Markdown filenames, valid text, and the 2 MiB limit", async () => {
  for (const filename of ["note.mdx", "note.html", "../note.md", "folder\\note.md"]) {
    assert.throws(() => importMarkdown("正文", filename), /只接受/);
  }
  assert.throws(() => importMarkdown("\u0000binary", "note.md"), /UTF-8/);
  assert.throws(() => importMarkdown("\uD800", "note.md"), /UTF-8/);
  assert.throws(() => importMarkdown(" ", "note.md"), /不能为空/);
  assert.throws(() => importMarkdown("中".repeat(700000), "note.md"), /2 MiB/);
  await assert.rejects(renderMarkdown("a".repeat(2 * 1024 * 1024 + 1)), /2 MiB/);
});

test("validates real dates, slugs, field types, lengths, and extra fields", () => {
  assert.deepEqual(validateArticleMetadata(validMetadata), validMetadata);
  for (const date of ["2026-02-29", "2024-02-30", "2026-13-01", "2026-1-01", "0000-01-01"]) {
    assert.throws(() => validateArticleMetadata({ ...validMetadata, date }), /日期/);
  }
  assert.equal(validateArticleMetadata({ ...validMetadata, date: "2024-02-29" }).date, "2024-02-29");
  for (const slug of ["constructor", "__proto__", "prototype", "../escape", "Hello", "two--hyphens", "中文", "a".repeat(121)]) {
    assert.throws(() => validateArticleMetadata({ ...validMetadata, slug }), /短链/);
  }
  assert.throws(() => validateArticleMetadata({ ...validMetadata, title: "x".repeat(201) }), /标题/);
  assert.throws(() => validateArticleMetadata({ ...validMetadata, tags: [42] }), /标签/);
  assert.throws(() => validateArticleMetadata({ ...validMetadata, extra: true }), /信息格式/);
  assert.throws(() => validateArticleMetadata(JSON.parse('{"__proto__":{},"title":"x"}')), /信息格式/);
  const originalTags = ["5G", " 5G ", "仿真"];
  assert.deepEqual(validateArticleMetadata({ ...validMetadata, tags: originalTags }).tags, ["5G", "仿真"]);
  assert.deepEqual(originalTags, ["5G", " 5G ", "仿真"]);
});

test("reports each unsupported image URL, including reference images", () => {
  const imported = importMarkdown("# 图片\n\n![one](./images/one.png)\n![two][local]\n![three](http://example.com/a.png)\n![good](/images/site.png)\n![good](https://example.com/a.png)\n\n[local]: ../two.png", "images.md");
  assert.equal(imported.warnings.filter((warning) => warning.includes("图片引用")).length, 3);
  assert.ok(imported.warnings.some((warning) => warning.includes("./images/one.png")));
  assert.ok(imported.warnings.some((warning) => warning.includes("../two.png")));
});

test("renders GFM, KaTeX and highlighted code with matching duplicate heading anchors", async () => {
  const markdown = "## 同名\n\n| 名称 | 值 |\n| --- | --- |\n| 测试 | 1 |\n\n## 同名\n\n### Q1：为什么不推荐直接算 (A^{-1}b)？\n\n$x^2$\n\n```js\nconst answer = 42;\n```\n";
  const { html, toc } = await renderMarkdown(markdown);
  assert.match(html, /<table>/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.equal(toc.length, 3);
  assert.notEqual(toc[0].id, toc[1].id);
  for (const item of toc) assert.ok(html.includes(`id="${item.id}"`));
  assert.equal(toc[2].text, "Q1：为什么不推荐直接算 (A^{-1}b)？");
});

test("does not execute raw HTML, JSX, JavaScript, YAML or MDX expressions", async () => {
  const marker = "markdownPublishingMustNeverExecute";
  const payload = `# 安全\n\n<script>globalThis.${marker} = true</script>\n\n<img src=x onerror="alert(1)">\n\n<Component onClick={() => alert(1)} />\n\n{globalThis.${marker} = true}\n\nimport x from 'node:fs';\n\n[危险](javascript:alert%281%29)\n\n![危险](data:image/svg+xml,evil)\n\n$\\href{javascript:alert(1)}{click}$`;
  const { html } = await renderMarkdown(payload);
  assert.doesNotMatch(html, /<script|<Component|onerror=|href="javascript:|src="data:/i);
  assert.equal((globalThis as Record<string, unknown>)[marker], undefined);
  assert.ok(importMarkdown(payload, "safe.md").warnings.some((warning) => warning.includes("HTML 或 JSX")));
});

test("blocks encoded JavaScript links and untrusted KaTeX HTML commands", async () => {
  const { html } = await renderMarkdown("[one](JaVaScRiPt:alert%281%29)\n\n[two](javascript&#58;alert%281%29)\n\n[three](data:text/html,evil)\n\n$\\htmlStyle{position:fixed}{x}$\n\n$\\includegraphics{https://example.com/evil.svg}$");
  assert.doesNotMatch(html, /href="(?:javascript|data):|style="[^"]*position\s*:\s*fixed|<img /i);
});

test("ignores hostile highlighting ranges while still rendering the code", async () => {
  const { html } = await renderMarkdown("```js {1-999999999999999} title=\"<script>alert(1)</script>\"\nconst answer = 42;\n```");
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /answer/);
  assert.doesNotMatch(html, /<script>/i);
});

test("allows only HTTPS or site-absolute images and preserves useful links", async () => {
  const { html } = await renderMarkdown("![good](https://example.com/a.png)\n![local](/images/a.png)\n![relative](./a.png)\n![http](http://example.com/a.png)\n![remote](//example.com/a.png)\n\n[外链](https://example.com/) [站内](/blog/hello) [邮箱](mailto:test@example.com)");
  assert.equal((html.match(/<img /g) ?? []).length, 2);
  assert.match(html, /src="https:\/\/example.com\/a.png"/);
  assert.match(html, /src="\/images\/a.png"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /href="\/blog\/hello"/);
  assert.match(html, /href="mailto:test@example.com"/);
});

test("keeps GFM footnote links matched to their safe prefixed IDs", async () => {
  const { html } = await renderMarkdown("## constructor\n\n有个脚注[^one]。\n\n[^one]: 脚注内容。\n");
  assert.match(html, /id="user-content-constructor"/);
  const links = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  for (const id of links) assert.ok(html.includes(`id="${id}"`), `missing anchor ${id}`);
});
