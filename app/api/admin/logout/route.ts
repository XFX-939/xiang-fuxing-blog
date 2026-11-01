import { adminAuthErrorResponse, adminSessionCookie, assertSameOrigin, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    requireAdmin(request);
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": adminSessionCookie("")
      }
    });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
