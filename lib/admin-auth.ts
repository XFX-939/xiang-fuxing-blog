import "server-only";

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "blog_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const PASSWORD_HASH_PATTERN = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS = 10;
const MAX_PARALLEL_LOGINS = 2;

type AdminConfig = {
  passwordHash: string;
  sessionSecret: string;
  origin: string;
  secure: boolean;
};

type Session = {
  v: number;
  iat: number;
  exp: number;
  nonce: string;
  credentials: string;
};

const publicMessages: Record<number, string> = {
  400: "请求格式不正确。",
  401: "密码错误或登录已失效，请重新登录。",
  403: "请求来源不受信任。",
  413: "请求内容过大。",
  429: "登录尝试过于频繁，请稍后再试。",
  503: "管理员入口尚未完成配置。"
};

export class AdminAuthError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? publicMessages[status] ?? "操作失败，请稍后重试。");
    this.name = "AdminAuthError";
    this.status = status;
  }
}

function readConfig(): AdminConfig | null {
  const passwordHash = process.env.BLOG_ADMIN_PASSWORD_HASH ?? "";
  const sessionSecret = process.env.BLOG_ADMIN_SESSION_SECRET ?? "";
  const configuredOrigin = process.env.BLOG_ADMIN_ORIGIN ?? "";

  if (!PASSWORD_HASH_PATTERN.test(passwordHash) || sessionSecret.length < 32 || sessionSecret.length > 4096) {
    return null;
  }

  try {
    const url = new URL(configuredOrigin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

    if (
      url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    ) {
      return null;
    }

    return { passwordHash, sessionSecret, origin: url.origin, secure: url.protocol === "https:" };
  } catch {
    return null;
  }
}

function requireConfig(): AdminConfig {
  const config = readConfig();
  if (!config) throw new AdminAuthError(503);
  return config;
}

function sign(value: string, config: AdminConfig) {
  return createHmac("sha256", config.sessionSecret).update(value).digest("base64url");
}

function credentialFingerprint(config: AdminConfig) {
  return sign(`credentials:${config.passwordHash}:${config.origin}`, config);
}

function equalStrings(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function readSessionCookie(header: string) {
  const values = header.split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${SESSION_COOKIE}=`))
    .map((part) => part.slice(SESSION_COOKIE.length + 1));

  return values.length === 1 ? values[0] : undefined;
}

function validSession(cookieHeader: string, config: AdminConfig) {
  const token = readSessionCookie(cookieHeader);
  if (!token || token.length > 2048) return false;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return false;
  const [body, signature] = parts;
  if (!equalStrings(signature, sign(body, config))) return false;

  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    const now = Math.floor(Date.now() / 1000);

    return session !== null && typeof session === "object" && session.v === 1 &&
      Number.isSafeInteger(session.iat) && Number.isSafeInteger(session.exp) &&
      session.iat <= now + 30 && session.exp > now && session.exp > session.iat &&
      session.exp - session.iat <= SESSION_SECONDS &&
      typeof session.nonce === "string" && /^[a-f0-9]{32}$/.test(session.nonce) &&
      typeof session.credentials === "string" &&
      equalStrings(session.credentials, credentialFingerprint(config));
  } catch {
    return false;
  }
}

export function getAdminStatus(cookieHeader?: string): "unconfigured" | "unauthenticated" | "authenticated" {
  const config = readConfig();
  if (!config) return "unconfigured";
  return validSession(cookieHeader ?? "", config) ? "authenticated" : "unauthenticated";
}

export function requireAdmin(request: Request): void {
  const config = requireConfig();
  if (!validSession(request.headers.get("cookie") ?? "", config)) throw new AdminAuthError(401);
}

export function assertSameOrigin(request: Request): void {
  const config = requireConfig();
  // Compare the actual Origin to an operator-configured value; forwarded headers
  // and a reverse proxy's internal request URL never establish trust.
  if (request.headers.get("origin") !== config.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AdminAuthError(403);
  }
}

// One bounded, global attempt budget per Node process. It deliberately does not
// trust client-controlled IP headers. Multiple workers need a shared limiter or
// a matching limit at the trusted reverse proxy; restarts reset this budget.
let loginAttempts: number[] = [];
let activeLogins = 0;

function reserveLoginAttempt() {
  const now = Date.now();
  loginAttempts = loginAttempts.filter((time) => now - time < LOGIN_WINDOW_MS && now >= time);
  if (loginAttempts.length >= LOGIN_ATTEMPTS || activeLogins >= MAX_PARALLEL_LOGINS) throw new AdminAuthError(429);
  loginAttempts.push(now);
  activeLogins += 1;
}

function derivePassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function authenticateAdmin(password: unknown): Promise<string> {
  const config = requireConfig();
  reserveLoginAttempt();

  try {
    if (typeof password !== "string" || password.length === 0 || Buffer.byteLength(password, "utf8") > 1024) {
      throw new AdminAuthError(401);
    }

    const match = PASSWORD_HASH_PATTERN.exec(config.passwordHash)!;
    const derived = await derivePassword(password, Buffer.from(match[1], "hex"));
    if (!timingSafeEqual(derived, Buffer.from(match[2], "hex"))) throw new AdminAuthError(401);

    const now = Math.floor(Date.now() / 1000);
    const session: Session = {
      v: 1, iat: now, exp: now + SESSION_SECONDS,
      nonce: randomBytes(16).toString("hex"), credentials: credentialFingerprint(config)
    };
    const body = Buffer.from(JSON.stringify(session)).toString("base64url");
    return `${body}.${sign(body, config)}`;
  } finally {
    activeLogins -= 1;
  }
}

export function adminSessionCookie(token: string): string {
  const config = requireConfig();
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? SESSION_SECONDS : 0}${config.secure ? "; Secure" : ""}`;
}

export function adminAuthErrorResponse(error: unknown): Response {
  const status = error instanceof AdminAuthError ? error.status : 500;
  // Never serialize unexpected error messages, environment values, or stacks.
  const message = publicMessages[status] ?? "操作失败，请稍后重试。";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": String(LOGIN_WINDOW_MS / 1000) } : {})
    }
  });
}
