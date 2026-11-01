import { revalidatePath } from "next/cache";
import { renderMarkdown, validateArticleMetadata } from "@/lib/markdown";
import { publishArticle, PublishingError } from "@/lib/published-storage";
import { authorizePublishing, publishingErrorResponse, publishingResponse, readPublishingJson, validateMarkdownBody } from "@/lib/publishing-http";
import { invalidatePostCache } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    authorizePublishing(request);
    const body = await readPublishingJson(request);
    const metadata = validateArticleMetadata(body.metadata);
    validateMarkdownBody(body.content);
    if (typeof body.requestId !== "string") throw new PublishingError("缺少发布请求标识，请重新导入文章。");
    // Render before committing: invalid content must never become public.
    await renderMarkdown(body.content);
    const result = await publishArticle({ metadata, content: body.content, requestId: body.requestId });
    invalidatePostCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/sitemap.xml");
    } catch {
      // The immutable article is already committed. Dynamic pages and file
      // signatures still read it; do not report a saved publication as failed.
      console.error("文章已保存；缓存刷新通知未完成，动态页面将读取最新内容。");
    }
    return publishingResponse(result, result.created ? 201 : 200);
  } catch (error) { return publishingErrorResponse(error); }
}
