import { getMarkdownWarnings, renderMarkdown, validateArticleMetadata } from "@/lib/markdown";
import { authorizePublishing, publishingErrorResponse, publishingResponse, readPublishingJson, validateMarkdownBody } from "@/lib/publishing-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    authorizePublishing(request);
    const body = await readPublishingJson(request);
    validateArticleMetadata(body.metadata);
    validateMarkdownBody(body.content);
    const rendered = await renderMarkdown(body.content);
    return publishingResponse({ ...rendered, warnings: getMarkdownWarnings(body.content) });
  } catch (error) { return publishingErrorResponse(error); }
}
