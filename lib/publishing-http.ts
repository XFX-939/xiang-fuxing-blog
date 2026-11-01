import "server-only";

import { NextResponse } from "next/server";
import { AdminAuthError, assertSameOrigin, requireAdmin } from "@/lib/admin-auth";
import { MarkdownValidationError } from "@/lib/markdown";
import { PublishingError } from "@/lib/published-storage";

export const MAX_MARKDOWN_BYTES = 2 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_MARKDOWN_BYTES + 64 * 1024;

export function authorizePublishing(request: Request) {
  assertSameOrigin(request);
  requireAdmin(request);
}

export async function readLimitedBody(request: Request, maximum = MAX_REQUEST_BYTES): Promise<Uint8Array> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > maximum) throw new PublishingError("上传内容超过 2 MiB 限制。", 413);
  if (!request.body) throw new PublishingError("请求内容不能为空。");
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new PublishingError("上传内容超过 2 MiB 限制。", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  return data;
}

export function decodeUtf8(bytes: Uint8Array) {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { throw new PublishingError("文件编码无效，请保存为 UTF-8 后重试。"); }
}

export async function readPublishingJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new PublishingError("请求格式必须为 JSON。", 415);
  }
  const text = decodeUtf8(await readLimitedBody(request));
  try {
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new PublishingError("请求内容不是有效的 JSON。"); }
}

export function validateMarkdownBody(content: unknown): asserts content is string {
  if (typeof content !== "string" || !content.trim()) throw new PublishingError("文章正文不能为空。");
  if (Buffer.byteLength(content, "utf8") > MAX_MARKDOWN_BYTES) throw new PublishingError("文章正文超过 2 MiB 限制。", 413);
}

export function publishingResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function publishingErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError || error instanceof PublishingError || error instanceof MarkdownValidationError) {
    return publishingResponse({ error: error.message }, error.status);
  }
  console.error("文章发布操作失败：", error instanceof Error ? error.name : "UnknownError");
  return publishingResponse({ error: "操作未完成，请稍后重试；若持续失败，请检查服务器配置及目录权限。" }, 500);
}
