import assert from "node:assert/strict";
import { createHmac, scryptSync } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { AdminAuthError, adminAuthErrorResponse, assertSameOrigin, getAdminStatus, requireAdmin } from "../lib/admin-auth";
import { POST as login } from "../app/api/admin/login/route";
import { POST as logout } from "../app/api/admin/logout/route";

const password = "test-only password 2026";
const salt = Buffer.alloc(16, 7);
const key = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const passwordHash = `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
const secret = "test-session-secret-at-least-32-characters";
const origin = "http://localhost:3000";
const testEnv: Record<string, string | undefined> = process.env;
const envKeys = ["BLOG_ADMIN_PASSWORD_HASH", "BLOG_ADMIN_SESSION_SECRET", "BLOG_ADMIN_ORIGIN", "NODE_ENV"] as const;
const originalEnv = Object.fromEntries(envKeys.map((name) => [name, process.env[name]]));
const originalNow = Date.now;

beforeEach(() => {
  process.env.BLOG_ADMIN_PASSWORD_HASH = passwordHash;
  process.env.BLOG_ADMIN_SESSION_SECRET = secret;
  process.env.BLOG_ADMIN_ORIGIN = origin;
});

afterEach(() => {
  Date.now = originalNow;
  for (const name of envKeys) {
    const value = originalEnv[name];
    if (value === undefined) delete testEnv[name];
    else testEnv[name] = value;
  }
});

function request(body: unknown = { password }, options: { origin?: string | null; cookie?: string; headers?: Record<string, string> } = {}) {
  const headers = new Headers({ "Content-Type": "application/json", ...options.headers });
  if (options.origin !== null) headers.set("Origin", options.origin ?? process.env.BLOG_ADMIN_ORIGIN!);
  if (options.cookie) headers.set("Cookie", options.cookie);
  return new Request("http://internal-upstream:3000/api/admin/login", {
    method: "POST", headers, body: JSON.stringify(body)
  });
}

async function signIn() {
  const response = await login(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const setCookie = response.headers.get("set-cookie")!;
  return { setCookie, cookie: setCookie.split(";")[0] };
}

function assertAuthError(action: () => void, status: number) {
  assert.throws(action, (error: unknown) => error instanceof AdminAuthError && error.status === status);
}

test("missing and malformed configuration fails closed while exposing a configuration status", async () => {
  delete process.env.BLOG_ADMIN_SESSION_SECRET;
  assert.equal(getAdminStatus(), "unconfigured");
  assertAuthError(() => requireAdmin(request()), 503);
  assertAuthError(() => assertSameOrigin(request()), 503);
  assert.equal((await login(request())).status, 503);

  process.env.BLOG_ADMIN_SESSION_SECRET = "short";
  assert.equal(getAdminStatus(), "unconfigured");
  process.env.BLOG_ADMIN_SESSION_SECRET = secret;
  process.env.BLOG_ADMIN_PASSWORD_HASH = "plain-text-is-never-a-valid-hash";
  assert.equal(getAdminStatus(), "unconfigured");
});

test("remote HTTP, URL credentials and non-origin paths are rejected; production loopback HTTP is allowed", () => {
  testEnv.NODE_ENV = "production";
  for (const invalid of ["http://example.com", "https://user:password@example.com", "https://example.com/admin", "https://example.com?x=1", "ftp://localhost"]) {
    process.env.BLOG_ADMIN_ORIGIN = invalid;
    assert.equal(getAdminStatus(), "unconfigured", invalid);
  }
  process.env.BLOG_ADMIN_ORIGIN = origin;
  assert.equal(getAdminStatus(), "unauthenticated");
});

test("origin checks use configuration rather than internal URLs or forwarded headers", () => {
  assert.doesNotThrow(() => assertSameOrigin(request()));
  for (const badOrigin of [null, "null", "https://attacker.example", `${origin}.attacker.example`]) {
    assertAuthError(() => assertSameOrigin(request(undefined, {
      origin: badOrigin,
      headers: { "X-Forwarded-Host": "localhost:3000", "X-Forwarded-Proto": "http" }
    })), 403);
  }
  assertAuthError(() => assertSameOrigin(request(undefined, { headers: { "Sec-Fetch-Site": "cross-site" } })), 403);
});

test("valid login issues an HTTP-only strict session and authenticates subsequent requests", async () => {
  const { setCookie, cookie } = await signIn();
  assert.match(setCookie, /; HttpOnly/);
  assert.match(setCookie, /; SameSite=Strict/);
  assert.match(setCookie, /; Max-Age=28800/);
  assert.doesNotMatch(setCookie, /; Secure/);
  assert.equal(getAdminStatus(cookie), "authenticated");
  assert.doesNotThrow(() => requireAdmin(request(undefined, { cookie })));
  assert.equal(getAdminStatus(), "unauthenticated");
  assertAuthError(() => requireAdmin(request()), 401);
  assert.equal(getAdminStatus(`${cookie}; ${cookie}`), "unauthenticated");
  const altered = cookie.slice(0, -1) + (cookie.endsWith("a") ? "b" : "a");
  assert.equal(getAdminStatus(altered), "unauthenticated");
});

test("password verification and login payload validation reject invalid requests", async () => {
  assert.equal((await login(request({ password: "incorrect password" }))).status, 401);
  assert.equal((await login(request({ password: { nested: password } }))).status, 401);
  assert.equal((await login(request([]))).status, 400);
  assert.equal((await login(request({}, { headers: { "Content-Type": "text/plain" } }))).status, 400);
  assert.equal((await login(request({ password: "x".repeat(5000) }))).status, 413);
  assert.equal((await login(new Request(`${origin}/api/admin/login`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{"
  }))).status, 400);
  assert.equal((await login(request(undefined, { origin: "https://attacker.example" }))).status, 403);
});

test("password hash, session secret and configured origin rotation invalidate existing sessions", async () => {
  const { cookie } = await signIn();
  process.env.BLOG_ADMIN_PASSWORD_HASH = `scrypt$${"08".repeat(16)}$${"00".repeat(64)}`;
  assert.equal(getAdminStatus(cookie), "unauthenticated");
  process.env.BLOG_ADMIN_PASSWORD_HASH = passwordHash;
  process.env.BLOG_ADMIN_SESSION_SECRET = `${secret}-rotated`;
  assert.equal(getAdminStatus(cookie), "unauthenticated");
  process.env.BLOG_ADMIN_SESSION_SECRET = secret;
  process.env.BLOG_ADMIN_ORIGIN = "https://example.com";
  assert.equal(getAdminStatus(cookie), "unauthenticated");
});

test("sessions expire and reject a signed payload with an excessive lifetime", async () => {
  const { cookie } = await signIn();
  const now = originalNow();
  Date.now = () => now + 8 * 60 * 60 * 1000 + 1000;
  assert.equal(getAdminStatus(cookie), "unauthenticated");
  Date.now = originalNow;

  const token = cookie.slice(cookie.indexOf("=") + 1);
  const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
  payload.exp = payload.iat + 24 * 60 * 60;
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  assert.equal(getAdminStatus(`blog_admin_session=${body}.${signature}`), "unauthenticated");
});

test("HTTPS sessions are secure and logout checks both authentication and origin", async () => {
  process.env.BLOG_ADMIN_ORIGIN = "https://example.com";
  const { setCookie, cookie } = await signIn();
  assert.match(setCookie, /; Secure/);
  assert.equal((await logout(request())).status, 401);
  assert.equal((await logout(request(undefined, { cookie, origin: "https://attacker.example" }))).status, 403);
  const response = await logout(request(undefined, { cookie }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie")!, /blog_admin_session=;.*Max-Age=0; Secure/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("a process-wide budget cannot be bypassed by changing forwarded IP headers", async () => {
  const future = originalNow() + 24 * 60 * 60 * 1000;
  Date.now = () => future;
  for (let i = 0; i < 10; i += 1) {
    const response = await login(request({ password: "wrong password" }, { headers: { "X-Forwarded-For": `192.0.2.${i}` } }));
    assert.equal(response.status, 401);
  }
  const limited = await login(request());
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "900");
  Date.now = () => future + 15 * 60 * 1000 + 1;
  assert.equal((await login(request())).status, 200);
});

test("parallel password verification is bounded before starting more scrypt work", async () => {
  const future = originalNow() + 48 * 60 * 60 * 1000;
  Date.now = () => future;
  const responses = await Promise.all([login(request()), login(request()), login(request())]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 200, 429]);
});

test("unexpected errors never disclose internal error details", async () => {
  const response = adminAuthErrorResponse(new Error("private internal path and secret"));
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /private|secret/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("the hash script accepts stdin, emits only a random salted hash and rejects weak input", () => {
  const script = path.join(process.cwd(), "scripts", "hash-admin-password.mjs");
  const first = spawnSync(process.execPath, [script], { input: `${password}\n`, encoding: "utf8" });
  const second = spawnSync(process.execPath, [script], { input: password, encoding: "utf8" });
  assert.equal(first.status, 0);
  assert.equal(second.status, 0);
  assert.match(first.stdout, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}\n$/);
  assert.notEqual(first.stdout, second.stdout);
  assert.doesNotMatch(first.stdout + first.stderr, new RegExp(password));
  const [, saltHex, keyHex] = first.stdout.trim().split("$");
  assert.equal(scryptSync(password, Buffer.from(saltHex, "hex"), 64, {
    N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024
  }).toString("hex"), keyHex);
  const rejected = spawnSync(process.execPath, [script], { input: "short", encoding: "utf8" });
  assert.equal(rejected.status, 1);
  assert.equal(rejected.stdout, "");
  assert.doesNotMatch(rejected.stderr, /short/);
});
