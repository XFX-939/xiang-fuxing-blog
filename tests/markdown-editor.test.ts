import assert from "node:assert/strict";
import { test } from "node:test";
import { applyMarkdownEdit, emptyArticleMetadata, mergeComposedMetadata, parseEditorTags, readEditorDraft, shanghaiToday, type EditorDraft } from "../lib/markdown-editor";

test("new writing sessions start with editable blank metadata and a Shanghai date", () => {
  assert.equal(shanghaiToday(new Date("2026-10-31T16:10:00Z")), "2026-11-01");
  assert.equal(shanghaiToday(new Date("2026-10-31T15:59:00Z")), "2026-10-31");
  assert.deepEqual(emptyArticleMetadata("2026-11-01"), { title: "", description: "", date: "2026-11-01", category: "未分类", tags: [], featured: false, slug: "" });
});

test("a delayed composition never overwrites fields the author has manually edited", () => {
  const current = { ...emptyArticleMetadata("2026-11-01"), title: "我的标题", category: "技术管理", tags: ["自选标签"], slug: "my-custom-url" };
  const derived = { ...emptyArticleMetadata("2026-11-02"), title: "Markdown标题", description: "自动摘要", category: "系统仿真", tags: ["自动标签"], slug: "pasted-unique" };
  const result = mergeComposedMetadata(current, derived, new Set(["title", "category", "tags", "slug"]), "pasted-unique.md");
  assert.equal(result.title, current.title);
  assert.equal(result.category, current.category);
  assert.deepEqual(result.tags, current.tags);
  assert.equal(result.slug, current.slug);
  assert.equal(result.description, derived.description);
  assert.equal(result.date, derived.date);
});

test("plain pasted prose gets a readable fallback title without changing its unique slug", () => {
  const derived = { ...emptyArticleMetadata("2026-11-01"), title: "pasted-id", description: "这是没有一级标题的正文摘要。", slug: "pasted-id" };
  const result = mergeComposedMetadata(emptyArticleMetadata("2026-11-01"), derived, new Set(), "pasted-id.md");
  assert.equal(result.title, derived.description);
  assert.equal(result.slug, "pasted-id");
  assert.equal(mergeComposedMetadata({ ...derived, title: "手动标题" }, derived, new Set(["title"]), "pasted-id.md").title, "手动标题");
});

test("drafts preserve raw frontmatter, body, manual choices and a stable document identity", () => {
  const draft: EditorDraft = {
    version: 1, source: "---\ntitle: 原始信息\n---\n\n# 粘贴正文\n\n保留  空格。", filename: "pasted-draft-id.md",
    metadata: { ...emptyArticleMetadata("2026-11-01"), title: "修改标题", slug: "custom-draft" },
    editedFields: ["title", "slug"], requestId: "12345678-1234-4321-8234-123456789abc", savedAt: Date.now()
  };
  assert.deepEqual(readEditorDraft(JSON.stringify(draft)), draft);
  for (const invalid of [null, "not-json", JSON.stringify({ ...draft, version: 2 }), JSON.stringify({ ...draft, source: "" }), JSON.stringify({ ...draft, filename: "../../bad.md" }), JSON.stringify({ ...draft, editedFields: ["password"] }), JSON.stringify({ ...draft, metadata: { ...draft.metadata, tags: [42] } }), JSON.stringify({ ...draft, source: "中".repeat(750000) })]) {
    assert.equal(readEditorDraft(invalid), null);
  }
});

test("tags retain interior spaces, discard empty delimiters and deduplicate", () => {
  assert.deepEqual(parseEditorTags("AI Coding， 5G, ,AI Coding，"), ["AI Coding", "5G"]);
  assert.deepEqual(parseEditorTags("，, "), []);
});

test("formatting wraps the actual selection and preserves text outside it", () => {
  const result = applyMarkdownEdit("前文 中文 后文", 3, 5, "bold");
  assert.equal(result.value, "前文 **中文** 后文");
  assert.equal(result.value.slice(result.selectionStart, result.selectionEnd), "中文");
  const placeholder = applyMarkdownEdit("", 0, 0, "italic");
  assert.equal(placeholder.value, "*斜体文字*");
  assert.equal(placeholder.value.slice(placeholder.selectionStart, placeholder.selectionEnd), "斜体文字");
});

test("list, heading and quote tools act on whole selected lines including an initial blank line", () => {
  assert.equal(applyMarkdownEdit("前段\n第一行\n第二行\n后段", 3, 10, "list").value, "前段\n- 第一行\n- 第二行\n后段");
  assert.equal(applyMarkdownEdit("\n正文", 0, 0, "heading").value, "## \n正文");
  assert.equal(applyMarkdownEdit("引用", 0, 2, "quote").value, "> 引用");
  assert.equal(applyMarkdownEdit("  第一行\n\t第二行", 0, 10, "outdent").value, "第一行\n第二行");
});

test("links, code and tables insert complete Markdown and select useful placeholders", () => {
  const link = applyMarkdownEdit("链接文字", 0, 4, "link");
  assert.equal(link.value, "[链接文字](https://)");
  assert.equal(link.value.slice(link.selectionStart, link.selectionEnd), "https://");
  const code = applyMarkdownEdit("段落代码尾部", 2, 4, "code");
  assert.equal(code.value, "段落\n```text\n代码\n```\n尾部");
  assert.equal(code.value.slice(code.selectionStart, code.selectionEnd), "代码");
  const table = applyMarkdownEdit("", 0, 0, "table");
  assert.match(table.value, /\| --- \| --- \|/);
});

test("Tab keeps an unselected caret collapsed and a trailing newline does not select the next line", () => {
  assert.deepEqual(applyMarkdownEdit("hello", 5, 5, "indent"), { value: "  hello", selectionStart: 7, selectionEnd: 7 });
  assert.deepEqual(applyMarkdownEdit("  hello", 7, 7, "outdent"), { value: "hello", selectionStart: 5, selectionEnd: 5 });
  assert.equal(applyMarkdownEdit("first\nsecond", 0, 6, "list").value, "- first\nsecond");
});
