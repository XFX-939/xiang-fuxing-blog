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
