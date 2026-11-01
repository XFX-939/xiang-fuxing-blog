import { importMarkdown, renderMarkdown } from "@/lib/markdown";
import { PublishingError } from "@/lib/published-storage";
import { authorizePublishing, decodeUtf8, MAX_MARKDOWN_BYTES, publishingErrorResponse, publishingResponse, readLimitedBody } from "@/lib/publishing-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    authorizePublishing(request);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
      throw new PublishingError("请选择一个 Markdown 文件。", 415);
    }
    const bytes = await readLimitedBody(request);
    let form: FormData;
    try {
      form = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type")! }, body: bytes as BodyInit }).formData();
    } catch { throw new PublishingError("文件上传格式无效，请重新选择文件。"); }
    const files = form.getAll("file");
    if (files.length !== 1 || typeof files[0] === "string") throw new PublishingError("每次请选择一个 .md 文件。");
    const file = files[0];
    if (!/\.md$/i.test(file.name)) throw new PublishingError("只支持 .md 文件，请先导出为 Markdown。", 415);
    if (file.size > MAX_MARKDOWN_BYTES) throw new PublishingError("文件超过 2 MiB 限制。", 413);
    const imported = importMarkdown(decodeUtf8(new Uint8Array(await file.arrayBuffer())), file.name);
    const rendered = await renderMarkdown(imported.content);
    return publishingResponse({ ...imported, html: rendered.html, toc: rendered.toc });
  } catch (error) { return publishingErrorResponse(error); }
}
