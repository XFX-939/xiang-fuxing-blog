import "server-only";

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { dump, JSON_SCHEMA, load } from "js-yaml";
import matter from "gray-matter";
import { validateArticleMetadata } from "@/lib/markdown";
import type { ArticleMetadata } from "@/lib/publishing-types";

export class PublishingError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "PublishingError";
  }
}

export type PublishedArticle = {
  metadata: ArticleMetadata;
  content: string;
  requestId: string;
  fingerprint: string;
};

/** A production release must never own the mutable article directory. */
export function getContentDirectory(required = false): string | null {
  const configured = process.env.BLOG_CONTENT_DIR?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    if (required) throw new PublishingError("尚未配置文章持久目录，请联系站点管理员。", 503);
    return null;
  }
  const directory = path.resolve(configured || path.join(process.cwd(), ".local-data", "blog"));
  if (process.env.NODE_ENV === "production") {
    if (!configured || !path.isAbsolute(configured)) {
      throw new PublishingError("生产环境的文章持久目录必须使用独立的绝对路径。", 503);
    }
    // Resolve existing parents too, so a symlink cannot put data inside a release.
    let ancestor = directory;
    const tail: string[] = [];
    while (!fs.existsSync(ancestor)) {
      tail.unshift(path.basename(ancestor));
      const parent = path.dirname(ancestor);
      if (parent === ancestor) break;
      ancestor = parent;
    }
    const realDirectory = path.join(fs.realpathSync(ancestor), ...tail);
    const realCheckout = fs.realpathSync(process.cwd());
    const relative = path.relative(realCheckout, realDirectory);
    if ((!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)) ||
        /(?:^|[/\\])(?:releases|current)(?:[/\\]|$)/.test(realDirectory) ||
        /(?:^|[/\\])(?:releases|current)(?:[/\\]|$)/.test(directory)) {
      throw new PublishingError("文章持久目录必须位于代码和 releases/current 目录之外。", 503);
    }
  }
  return directory;
}

function parseStored(source: string): PublishedArticle {
  const parsed = matter(source, {
    engines: { yaml: (text: string) => load(text, { schema: JSON_SCHEMA }) as object }
  });
  const metadata = validateArticleMetadata(Object.fromEntries(
    ["title", "description", "date", "category", "tags", "featured", "slug"].map((key) => [key, parsed.data[key]])
  ));
  if (typeof parsed.data.publishRequestId !== "string" || typeof parsed.data.publishFingerprint !== "string") {
    throw new Error("Invalid publication record");
  }
  return { metadata, content: parsed.content, requestId: parsed.data.publishRequestId, fingerprint: parsed.data.publishFingerprint };
}

export function readPublishedArticle(file: string): PublishedArticle {
  return parseStored(fs.readFileSync(file, "utf8"));
}

export function getPublishedFiles(): string[] {
  const directory = getContentDirectory();
  if (!directory || !fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(entry.name))
    .map((entry) => path.join(directory, entry.name)).sort();
}

async function createImmutableFile(target: string, source: string): Promise<boolean> {
  const temporary = path.join(path.dirname(target), `.pending-${randomUUID()}`);
  try {
    const handle = await fsp.open(temporary, "wx", 0o600);
    try { await handle.writeFile(source, "utf8"); await handle.sync(); }
    finally { await handle.close(); }
    try { await fsp.link(temporary, target); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
      throw error;
    }
    const directoryHandle = await fsp.open(path.dirname(target), "r");
    try { await directoryHandle.sync(); } finally { await directoryHandle.close(); }
    return true;
  } finally {
    await fsp.unlink(temporary).catch(() => undefined);
  }
}

export async function publishArticle(input: { metadata: unknown; content: string; requestId: string }) {
  const metadata = validateArticleMetadata(input.metadata);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) {
    throw new PublishingError("发布请求标识无效，请重新导入文章。" );
  }
  if (typeof input.content !== "string" || !input.content.trim() || Buffer.byteLength(input.content) > 2 * 1024 * 1024) {
    throw new PublishingError("正文为空或超过 2 MiB 限制。", 400);
  }
  const directory = getContentDirectory(true)!;
  await fsp.mkdir(directory, { recursive: true, mode: 0o700 });
  const fingerprint = createHash("sha256").update(JSON.stringify({ metadata, content: input.content })).digest("hex");
  // Immutable request records coordinate retries across processes, without a
  // process-owned lock that could survive a crash and block future publishing.
  const requests = path.join(directory, ".requests");
  await fsp.mkdir(requests, { recursive: true, mode: 0o700 });
  const requestFile = path.join(requests, `${input.requestId.toLowerCase()}.json`);
  const requestRecord = JSON.stringify({ fingerprint, slug: metadata.slug });
  await createImmutableFile(requestFile, requestRecord);
  const claimed = JSON.parse(await fsp.readFile(requestFile, "utf8")) as { fingerprint: string; slug: string };
  if (claimed.fingerprint !== fingerprint || claimed.slug !== metadata.slug) {
    throw new PublishingError("此发布请求已用于其他内容，请重新导入后发布。", 409);
  }
  const target = path.join(directory, `${metadata.slug}.md`);
  const legacy = path.join(process.cwd(), "content", "blog", `${metadata.slug}.mdx`);
  if (fs.existsSync(legacy)) {
    throw new PublishingError("这个文章地址已被使用，请修改 slug 后重试，原文章不会被覆盖。", 409);
  }
  if (fs.existsSync(target)) {
    const existing = readPublishedArticle(target);
    if (existing.requestId.toLowerCase() === input.requestId.toLowerCase() && existing.fingerprint === fingerprint) {
      return { slug: metadata.slug, url: `/blog/${metadata.slug}`, created: false };
    }
    throw new PublishingError("这个文章地址已被使用，请修改 slug 后重试，原文章不会被覆盖。", 409);
  }
  const header = dump({ ...metadata, draft: false, publishRequestId: input.requestId.toLowerCase(), publishFingerprint: fingerprint }, {
    schema: JSON_SCHEMA, noRefs: true, lineWidth: -1, sortKeys: false
  });
  const serialized = `---\n${header}---\n${input.content}`;
  const roundTrip = parseStored(serialized);
  if (roundTrip.content !== input.content || roundTrip.fingerprint !== fingerprint) {
    throw new PublishingError("文章保存校验失败，请重试。", 500);
  }
  const created = await createImmutableFile(target, serialized);
  if (!created) {
    const existing = readPublishedArticle(target);
    if (existing.requestId.toLowerCase() !== input.requestId.toLowerCase() || existing.fingerprint !== fingerprint) {
      throw new PublishingError("文章地址发生冲突，请修改 slug 后重试。", 409);
    }
  }
  return { slug: metadata.slug, url: `/blog/${metadata.slug}`, created };
}
