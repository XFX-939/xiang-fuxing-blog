import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, test } from "node:test";
import { getContentDirectory, getPublishedFiles, publishArticle, PublishingError, readPublishedArticle } from "../lib/published-storage";
import { getAllCategories, getAllPosts, getAllTags, getPostBySlug, invalidatePostCache } from "../lib/posts";
import type { ArticleMetadata } from "../lib/publishing-types";

const testEnv: Record<string, string | undefined> = process.env;
const originalEnv = { BLOG_CONTENT_DIR: testEnv.BLOG_CONTENT_DIR, NODE_ENV: testEnv.NODE_ENV };
let scratch = "";
let directory = "";

beforeEach(async () => {
  scratch = await fs.mkdtemp(path.join(os.tmpdir(), "blog-published-storage-"));
  directory = path.join(scratch, "articles");
  testEnv.BLOG_CONTENT_DIR = directory;
  testEnv.NODE_ENV = "test";
  invalidatePostCache();
});

afterEach(async () => {
  invalidatePostCache();
  for (const key of ["BLOG_CONTENT_DIR", "NODE_ENV"] as const) {
    if (originalEnv[key] === undefined) delete testEnv[key];
    else testEnv[key] = originalEnv[key];
  }
  await fs.rm(scratch, { recursive: true, force: true });
});

function article(slug = "published-fixture", overrides: Partial<ArticleMetadata> = {}) {
  return {
    metadata: {
      title: "发布存储验收文章", description: "保持原稿与持久化边界。", date: "2026-11-01",
      category: "发布验收分类", tags: ["发布验收标签"], featured: false, slug, ...overrides
    },
    content: "\r\n# 原始标题\r\n\r\n保留  两个空格与中文。\r\n\r\n```js\r\nconst answer = 42;\r\n```\r\n",
    requestId: randomUUID()
  };
}

async function entries() {
  return fs.readdir(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
}

async function assertNoPending() {
  assert.deepEqual((await entries()).filter((name) => name.startsWith(".pending-")), []);
  const requests = await fs.readdir(path.join(directory, ".requests")).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  assert.deepEqual(requests.filter((name) => name.startsWith(".pending-")), []);
}

function isConflict(error: unknown) {
  return error instanceof PublishingError && error.status === 409;
}

type WorkerOutcome = { ok: true; result: { slug: string; url: string; created: boolean } } | { ok: false; status: number; error: string };

function publishInAnotherProcess(input: ReturnType<typeof article>): Promise<WorkerOutcome> {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), "lib", "published-storage.ts")).href;
  const source = `
    import { publishArticle } from ${JSON.stringify(moduleUrl)};
    let text = "";
    for await (const chunk of process.stdin) text += chunk;
    try {
      const result = await publishArticle(JSON.parse(text));
      process.stdout.write(JSON.stringify({ ok: true, result }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ ok: false, status: error.status ?? 500, error: error.message }));
    }
  `;
  return new Promise((resolve, reject) => {
    const loader = pathToFileURL(path.join(process.cwd(), "scripts", "register-test-loader.mjs")).href;
    const child = spawn(process.execPath, ["--conditions=react-server", "--import", loader, "--input-type=module", "--eval", source], {
      cwd: process.cwd(), env: { ...process.env }, stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Publication worker timed out"));
    }, 15000);
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`Publication worker exited ${code}: ${stderr}`));
      try { resolve(JSON.parse(stdout) as WorkerOutcome); }
      catch { reject(new Error(`Invalid worker output: ${stdout} ${stderr}`)); }
    });
    child.stdin.on("error", () => { /* A failed worker is reported by close/error. */ });
    child.stdin.end(JSON.stringify(input));
  });
}

test("publishes a complete article and preserves body, metadata and request identity", { concurrency: false }, async () => {
  const input = article();
  const result = await publishArticle(input);
  assert.deepEqual(result, { slug: input.metadata.slug, url: `/blog/${input.metadata.slug}`, created: true });
  const files = getPublishedFiles();
  assert.deepEqual(files, [path.join(directory, `${input.metadata.slug}.md`)]);
  const stored = readPublishedArticle(files[0]);
  assert.deepEqual(stored.metadata, input.metadata);
  assert.equal(stored.content, input.content);
  assert.equal(stored.requestId, input.requestId);
  assert.match(stored.fingerprint, /^[a-f0-9]{64}$/);
  assert.match(await fs.readFile(files[0], "utf8"), /draft: false/);
  await assertNoPending();
});

test("identical retries are idempotent; reuse for changed content or another slug is rejected", { concurrency: false }, async () => {
  const input = article();
  await publishArticle(input);
  const file = getPublishedFiles()[0];
  const original = await fs.readFile(file, "utf8");
  assert.equal((await publishArticle(input)).created, false);
  await assert.rejects(publishArticle({ ...input, content: `${input.content}\nChanged.` }), isConflict);
  await assert.rejects(publishArticle({ ...input, metadata: { ...input.metadata, slug: "another-slug" } }), isConflict);
  assert.deepEqual(getPublishedFiles(), [file]);
  assert.equal(await fs.readFile(file, "utf8"), original);
  await assertNoPending();
});

test("UUID request identity is case insensitive for both retry and cross-slug rejection", { concurrency: false }, async () => {
  const input = article("case-insensitive-request");
  await publishArticle({ ...input, requestId: input.requestId.toUpperCase() });
  assert.equal((await publishArticle(input)).created, false);
  assert.equal((await publishArticle({ ...input, requestId: input.requestId.toUpperCase() })).created, false);
  await assert.rejects(publishArticle({ ...input, metadata: { ...input.metadata, slug: "case-reused-request" } }), isConflict);
  assert.equal(getPublishedFiles().length, 1);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).requestId, input.requestId.toLowerCase());
  await assertNoPending();
});

test("body text beginning with YAML-like delimiters is stored verbatim without a second parse", { concurrency: false }, async () => {
  const bodies = [
    "---\ntitle: 这是正文而非文章标题\n---\n\n## 原稿章节\n正文。\n",
    "---js\n({ title: process.exit() })\n---\n正文保留为文本。",
    "---\n正文没有结束分隔线，也不应被当作frontmatter。"
  ];
  for (let index = 0; index < bodies.length; index += 1) {
    const input = { ...article(`yaml-looking-body-${index}`), content: bodies[index] };
    await publishArticle(input);
    const stored = readPublishedArticle(path.join(directory, `${input.metadata.slug}.md`));
    assert.equal(stored.content, bodies[index]);
    assert.equal(stored.metadata.title, input.metadata.title);
    assert.equal(getPostBySlug(input.metadata.slug)?.content, bodies[index]);
  }
  assert.equal(getPublishedFiles().length, bodies.length);
  await assertNoPending();
});

test("a new request cannot overwrite an existing published slug", { concurrency: false }, async () => {
  const first = article();
  await publishArticle(first);
  const file = getPublishedFiles()[0];
  const original = await fs.readFile(file, "utf8");
  const second = article(first.metadata.slug, { title: "不允许覆盖" });
  await assert.rejects(publishArticle(second), isConflict);
  assert.equal(await fs.readFile(file, "utf8"), original);
  assert.equal(getPublishedFiles().length, 1);
  await assertNoPending();
});

test("legacy MDX URLs remain reserved and their files are never altered", { concurrency: false }, async () => {
  const slug = "understanding-system-simulation";
  const legacyFile = path.join(process.cwd(), "content", "blog", `${slug}.mdx`);
  const original = await fs.readFile(legacyFile, "utf8");
  await assert.rejects(publishArticle(article(slug)), isConflict);
  assert.deepEqual(getPublishedFiles(), []);
  assert.equal(await fs.readFile(legacyFile, "utf8"), original);
  assert.equal(getPostBySlug(slug)?.format, "mdx");
  await assertNoPending();
});

test("invalid metadata, body or request IDs produce no public or pending article", { concurrency: false }, async () => {
  const valid = article();
  const invalidInputs = [
    { ...valid, metadata: { ...valid.metadata, slug: "../escape" } },
    { ...valid, metadata: { ...valid.metadata, date: "2026-02-30" } },
    { ...valid, metadata: { ...valid.metadata, title: "" } },
    { ...valid, metadata: { ...valid.metadata, extra: "unsupported" } },
    { ...valid, requestId: "not-a-request-id" },
    { ...valid, content: "   " },
    { ...valid, content: "x".repeat(2 * 1024 * 1024 + 1) }
  ];
  for (const input of invalidInputs) {
    await assert.rejects(publishArticle(input));
    assert.deepEqual(getPublishedFiles(), []);
    await assertNoPending();
  }
  assert.deepEqual(await fs.readdir(scratch), []);
});

test("same-process concurrent retries converge on one complete immutable article", { concurrency: false }, async () => {
  const input = article();
  const results = await Promise.all([publishArticle(input), publishArticle(input), publishArticle(input)]);
  assert.equal(results.filter((result) => result.created).length, 1);
  assert.equal(getPublishedFiles().length, 1);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).content, input.content);
  await assertNoPending();
});

test("same-process competing requests cannot replace the winning slug", { concurrency: false }, async () => {
  const inputs = [article("competing-slug", { title: "候选一" }), article("competing-slug", { title: "候选二" })];
  const results = await Promise.allSettled(inputs.map((input) => publishArticle(input)));
  const winner = results.findIndex((result) => result.status === "fulfilled");
  assert.notEqual(winner, -1);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  for (const result of results) if (result.status === "rejected") assert.ok(isConflict(result.reason));
  const stored = readPublishedArticle(getPublishedFiles()[0]);
  assert.equal(stored.requestId, inputs[winner].requestId);
  assert.equal(stored.metadata.title, inputs[winner].metadata.title);
  assert.equal(getPublishedFiles().length, 1);
  await assertNoPending();
});

test("independent Node processes share idempotency and reject cross-slug request reuse", { concurrency: false }, async () => {
  const input = article("cross-process-idempotency");
  const results = await Promise.all([publishInAnotherProcess(input), publishInAnotherProcess(input)]);
  assert.ok(results.every((result) => result.ok));
  assert.equal(results.filter((result) => result.ok && result.result.created).length, 1);
  const changed = await publishInAnotherProcess({ ...input, metadata: { ...input.metadata, slug: "cross-process-reused-id" } });
  assert.equal(changed.ok, false);
  if (!changed.ok) assert.equal(changed.status, 409);
  assert.equal(getPublishedFiles().length, 1);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).content, input.content);
  await assertNoPending();
});

test("independent processes cannot overwrite each other when competing for one slug", { concurrency: false }, async () => {
  const inputs = [article("cross-process-slug", { title: "进程一" }), article("cross-process-slug", { title: "进程二" })];
  const results = await Promise.all(inputs.map(publishInAnotherProcess));
  assert.equal(results.filter((result) => result.ok).length, 1);
  const winner = results.findIndex((result) => result.ok);
  for (const result of results) if (!result.ok) assert.equal(result.status, 409);
  assert.equal(getPublishedFiles().length, 1);
  const stored = readPublishedArticle(getPublishedFiles()[0]);
  assert.equal(stored.requestId, inputs[winner].requestId);
  assert.equal(stored.metadata.title, inputs[winner].metadata.title);
  await assertNoPending();
});

test("an interrupted publication can be retried without a permanent lock or duplicate", { concurrency: false }, async () => {
  const input = article("recover-interrupted-publication");
  await publishArticle(input);
  // This recreates the recoverable state: request identity exists, article does not.
  await fs.unlink(getPublishedFiles()[0]);
  const result = await publishArticle(input);
  assert.equal(result.slug, input.metadata.slug);
  assert.equal(getPublishedFiles().length, 1);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).content, input.content);
  assert.equal((await publishArticle(input)).created, false);
  await assertNoPending();
});

test("hidden crash remnants and symlinks never enter the public article index", { concurrency: false }, async () => {
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, ".pending-interrupted"), "---\ntitle: half written");
  await fs.writeFile(path.join(directory, "not-markdown.txt"), "not public");
  const outside = path.join(scratch, "outside.md");
  await fs.writeFile(outside, "not a publication");
  await fs.symlink(outside, path.join(directory, "symlink-article.md"));
  assert.deepEqual(getPublishedFiles(), []);
  assert.ok(!getAllPosts().some((post) => post.slug === "symlink-article"));
  const input = article("after-interrupted-temp");
  await publishArticle(input);
  assert.deepEqual(getPublishedFiles(), [path.join(directory, `${input.metadata.slug}.md`)]);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).content, input.content);
});

test("a warmed content cache observes publications from another process without explicit invalidation", { concurrency: false }, async () => {
  const input = article("another-process-new-article");
  const before = getAllPosts();
  assert.ok(!before.some((post) => post.slug === input.metadata.slug));
  const result = await publishInAnotherProcess(input);
  assert.equal(result.ok, true);
  const after = getAllPosts();
  assert.equal(after.length, before.length + 1);
  assert.ok(after.some((post) => post.slug === input.metadata.slug));
  const detail = getPostBySlug(input.metadata.slug);
  assert.equal(detail?.content, input.content);
  assert.equal(detail?.format, "markdown");
  assert.ok(getAllCategories().some((category) => category.name === input.metadata.category));
  assert.ok(getAllTags().some((tag) => tag.name === input.metadata.tags[0]));
});

test("one damaged stored record is isolated from healthy articles and future publications", { concurrency: false }, async () => {
  const healthy = article("healthy-despite-damaged-neighbor");
  await publishArticle(healthy);
  getAllPosts();
  const damaged = path.join(directory, "damaged-publication.md");
  await fs.writeFile(damaged, "---\ntitle: [broken metadata\n---\npartial data");
  assert.throws(() => readPublishedArticle(damaged));
  const posts = getAllPosts();
  assert.ok(posts.some((post) => post.slug === healthy.metadata.slug));
  assert.ok(!posts.some((post) => post.slug === "damaged-publication"));
  assert.equal(getPostBySlug(healthy.metadata.slug)?.content, healthy.content);
  const next = article("publication-after-damaged-neighbor");
  assert.equal((await publishArticle(next)).created, true);
  assert.ok(getAllPosts().some((post) => post.slug === next.metadata.slug));
  await assertNoPending();
});

test("production requires an absolute persistent directory outside code and release paths", { concurrency: false }, async () => {
  testEnv.NODE_ENV = "production";
  delete testEnv.BLOG_CONTENT_DIR;
  assert.equal(getContentDirectory(), null);
  assert.deepEqual(getPublishedFiles(), []);
  assert.throws(() => getContentDirectory(true), (error: unknown) => error instanceof PublishingError && error.status === 503);
  for (const invalid of ["relative/blog", process.cwd(), path.join(process.cwd(), "data", "articles"), path.join(scratch, "releases", "one", "articles"), path.join(scratch, "current", "articles")]) {
    testEnv.BLOG_CONTENT_DIR = invalid;
    assert.throws(() => getContentDirectory(true), (error: unknown) => error instanceof PublishingError && error.status === 503, invalid);
  }
  const checkoutLink = path.join(scratch, "checkout-link");
  await fs.symlink(process.cwd(), checkoutLink, "dir");
  testEnv.BLOG_CONTENT_DIR = path.join(checkoutLink, "uncreated-article-dir");
  assert.throws(() => getContentDirectory(true), (error: unknown) => error instanceof PublishingError && error.status === 503);
  testEnv.BLOG_CONTENT_DIR = directory;
  assert.equal(getContentDirectory(true), directory);
  const input = article("production-persistent-article");
  assert.equal((await publishArticle(input)).created, true);
  assert.equal(readPublishedArticle(getPublishedFiles()[0]).content, input.content);
});
