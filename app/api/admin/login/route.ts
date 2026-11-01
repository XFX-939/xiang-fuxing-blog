import { AdminAuthError, adminAuthErrorResponse, adminSessionCookie, assertSameOrigin, authenticateAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readPassword(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AdminAuthError(400);
  }

  const reader = request.body?.getReader();
  if (!reader) throw new AdminAuthError(400);
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        throw new AdminAuthError(413);
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body) || !("password" in body)) {
      throw new AdminAuthError(400);
    }
    return body.password;
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw new AdminAuthError(400);
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = await authenticateAdmin(await readPassword(request));
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": adminSessionCookie(token)
      }
    });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
