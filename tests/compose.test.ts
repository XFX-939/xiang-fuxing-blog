import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { POST as compose } from "../app/api/admin/compose/route";
import { MAX_MARKDOWN_BYTES, MAX_REQUEST_BYTES } from "../lib/publishing-http";

const origin = "https://compose.example.test";
const secret = "compose-test-session-secret-not-a-production-secret";
// A syntactically valid fixture, never a real password or credential.
const passwordHash = `scrypt$${"01".repeat(16)}$${"02".repeat(64)}`;
const envKeys = ["BLOG_ADMIN_PASSWORD_HASH", "BLOG_ADMIN_SESSION_SECRET", "BLOG_ADMIN_ORIGIN", "BLOG_CONTENT_DIR"] as const;
const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
let scratch = "";

function sessionCookie() {
  const sign = (value: string) => createHmac("sha256", secret).update(value).digest("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({
    v: 1, iat: now, exp: now + 600, nonce: "03".repeat(16),
    credentials: sign(`credentials:${passwordHash}:${origin}`)
  })).toString("base64url");
  return `blog_admin_session=${body}.${sign(body)}`;
}

beforeEach(async () => {
  process.env.BLOG_ADMIN_PASSWORD_HASH = passwordHash;
  process.env.BLOG_ADMIN_SESSION_SECRET = secret;
  process.env.BLOG_ADMIN_ORIGIN = origin;
  scratch = await fs.mkdtemp(path.join(os.tmpdir(), "blog-compose-test-"));
  process.env.BLOG_CONTENT_DIR = path.join(scratch, "never-created-content");
});

afterEach(async () => {
  try {
    // Only the test harness creates scratch. The endpoint must leave it empty:
    // no article files, pending writes, request records, or storage directories.
    assert.deepEqual(await fs.readdir(scratch), []);
  } finally {
    await fs.rm(scratch, { recursive: true, force: true });
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

function request(body: unknown, options: { cookie?: string | null; origin?: string | null; headers?: Record<string, string>; rawBody?: BodyInit } = {}) {
  const headers = new Headers({ "Content-Type": "application/json", ...options.headers });
  if (options.origin !== null) headers.set("Origin", options.origin ?? origin);
  if (options.cookie !== null) headers.set("Cookie", options.cookie ?? sessionCookie());
  return new Request("http://internal-upstream:3000/api/admin/compose", {
    method: "POST", headers, body: options.rawBody ?? JSON.stringify(body)
  });
}

test("composes pasted JSON Markdown without a file and derives metadata", async () => {
  const source = "# 粘贴的无线笔记\n\n摘要来自第一段，正文原样保留。\n\n## 原理\n\n**核心机制**。\n";
  const response = await compose(request({ source }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const result = await response.json();
  assert.equal(result.content, source);
  assert.equal(result.metadata.title, "粘贴的无线笔记");
  assert.equal(result.metadata.description, "摘要来自第一段，正文原样保留。");
  assert.equal(result.metadata.category, "未分类");
  assert.deepEqual(result.metadata.tags, []);
  assert.equal(result.metadata.featured, false);
  assert.equal(result.metadata.slug, "nian-tie-de-wu-xian-bi-ji");
  assert.deepEqual(result.anchors.map((anchor: { line: number }) => anchor.line), [5]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  assert.equal(result.metadata.date, today);
  assert.match(result.html, /<strong>核心机制<\/strong>/);
  assert.equal(result.toc.length, 1);
  assert.ok(result.html.includes(`id="${result.toc[0].id}"`));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.url, undefined);
  assert.equal(result.created, undefined);
});

test("separates optional frontmatter from the original Markdown body", async () => {
  const content = "\r\n# 正文标题\r\n\r\n保留  两个空格。\r\n\r\n![图片](./local.png)\r\n";
  const source = "\uFEFF---\r\ntitle: 自定义标题\r\ndescription: 原文摘要\r\ndate: 2024-02-29\r\ncategory: 系统仿真\r\ntags: [5G, 仿真]\r\nfeatured: true\r\nslug: custom-note\r\n---\r\n" + content;
  const response = await compose(request({ source, filename: "notes.md" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.content, content);
  assert.deepEqual(result.metadata, { title: "自定义标题", description: "原文摘要", date: "2024-02-29", category: "系统仿真", tags: ["5G", "仿真"], featured: true, slug: "custom-note" });
  assert.ok(result.warnings.some((warning: string) => warning.includes("./local.png")));
  assert.doesNotMatch(result.html, /src="\.\/local.png"/);
});

test("treats malicious MDX expressions, scripts and imports as non-executable input", async () => {
  const marker = "composeEndpointMustNeverExecute";
  const source = `# 安全\n\n<script>globalThis.${marker} = true</script>\n\n<Component onClick={() => alert(1)} />\n\n{globalThis.${marker} = true}\n\nimport fs from 'node:fs';\n\n[危险](javascript:alert%281%29)\n`;
  const response = await compose(request({ source }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.content, source);
  assert.equal((globalThis as Record<string, unknown>)[marker], undefined);
  assert.doesNotMatch(result.html, /<script|<Component|href="javascript:/i);
  assert.ok(result.html.includes(`{globalThis.${marker} = true}`));
});

test("rejects missing and invalid administrator sessions before parsing input", async () => {
  for (const cookie of [null, "blog_admin_session=invalid"]) {
    const response = await compose(request({ source: "# 标题" }, { cookie }));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  delete process.env.BLOG_ADMIN_SESSION_SECRET;
  assert.equal((await compose(request({ source: "# 标题" }))).status, 503);
});

test("rejects cross-origin, absent Origin, and cross-site requests", async () => {
  for (const requestOrigin of [null, "null", "https://attacker.example", `${origin}.attacker.example`]) {
    assert.equal((await compose(request({ source: "# 标题" }, { origin: requestOrigin }))).status, 403);
  }
  assert.equal((await compose(request({ source: "# 标题" }, { headers: { "Sec-Fetch-Site": "cross-site" } }))).status, 403);
});

test("requires valid UTF-8 JSON and a nonempty string source", async () => {
  const invalidUtf8 = new Uint8Array([0x7b, 0x22, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x22, 0x3a, 0x22, 0xc3, 0x28, 0x22, 0x7d]);
  const badEncoding = await compose(request({}, { rawBody: invalidUtf8 }));
  assert.equal(badEncoding.status, 400);
  assert.match((await badEncoding.json()).error, /UTF-8/);
  for (const rawBody of ["{", "[]", "null", '"text"']) {
    assert.equal((await compose(request({}, { rawBody }))).status, 400);
  }
  for (const source of [undefined, null, 42, {}, [], "", " \n ", "\u0000binary", "\uD800"]) {
    assert.equal((await compose(request({ source }))).status, 400);
  }
  assert.equal((await compose(request({ source: "# 标题" }, { headers: { "Content-Type": "text/plain" } }))).status, 415);
});

test("rejects unsafe optional filenames and executable frontmatter", async () => {
  for (const filename of [null, 42, "notes.mdx", "notes.html", "../notes.md", "folder\\notes.md", "a".repeat(256) + ".md"]) {
    assert.equal((await compose(request({ source: "# 标题", filename }))).status, 400);
  }
  const response = await compose(request({ source: "---\ntitle: !!js/function 'function(){ return 1; }'\n---\n正文" }));
  assert.equal(response.status, 400);
  assert.doesNotMatch(await response.text(), /node_modules|\/Users\/|stack/);
});

test("enforces source and streamed JSON request limits without trusting content-length", async () => {
  const sourceTooLarge = await compose(request({ source: "a".repeat(MAX_MARKDOWN_BYTES + 1) }));
  assert.equal(sourceTooLarge.status, 413);
  const requestTooLarge = await compose(request({}, { rawBody: " ".repeat(MAX_REQUEST_BYTES + 1) }));
  assert.equal(requestTooLarge.status, 413);
  const declaredTooLarge = await compose(request({ source: "# 标题" }, { headers: { "Content-Length": String(MAX_REQUEST_BYTES + 1) } }));
  assert.equal(declaredTooLarge.status, 413);
  const falseSmallLength = await compose(request({ source: "a".repeat(MAX_MARKDOWN_BYTES + 1) }, { headers: { "Content-Length": "1" } }));
  assert.equal(falseSmallLength.status, 413);
});

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
