import { importMarkdown, renderMarkdown } from "@/lib/markdown";
import { PublishingError } from "@/lib/published-storage";
import { authorizePublishing, publishingErrorResponse, publishingResponse, readPublishingJson, validateMarkdownBody } from "@/lib/publishing-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    authorizePublishing(request);
    const body = await readPublishingJson(request);
    validateMarkdownBody(body.source);
    const filename = body.filename === undefined ? "pasted-article.md" : body.filename;
    if (typeof filename !== "string" || filename.length > 255) {
      throw new PublishingError("文章来源名称必须是有效的 .md 文件名，最长 255 字符。");
    }
    // Parsing and preview are intentionally independent of publication/storage.
    const imported = importMarkdown(body.source, filename);
    const rendered = await renderMarkdown(imported.content);
    return publishingResponse({ ...imported, html: rendered.html, toc: rendered.toc });
  } catch (error) {
    return publishingErrorResponse(error);
  }
}
