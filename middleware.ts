import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UI_COOKIE_NAME = "xfx-ui";
const SIGNAL_COOKIE_VALUE = "signal-v1";
const SIGNAL_PREFIX = "/signal-preview";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PRODUCTION_ORIGIN = "https://xiangfuxing.tech";

const staticRoutes = new Set([
  "/",
  "/about",
  "/archive",
  "/blog",
  "/categories",
  "/collaboration",
  "/methodology",
  "/projects",
  "/tags"
]);

const dynamicContentRoute = /^\/(?:blog|categories|tags|topics)\/[^/]+$/;

function withoutTrailingSlash(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/$/, "");
}

function isCanonicalPage(pathname: string) {
  const normalized = withoutTrailingSlash(pathname);
  return staticRoutes.has(normalized) || dynamicContentRoute.test(normalized);
}

function toCanonicalPath(pathname: string) {
  if (pathname === SIGNAL_PREFIX || pathname === `${SIGNAL_PREFIX}/`) {
    return "/";
  }

  if (pathname.startsWith(`${SIGNAL_PREFIX}/`)) {
    return pathname.slice(SIGNAL_PREFIX.length) || "/";
  }

  return pathname;
}

function setSignalCookie(response: NextResponse) {
  response.cookies.set({
    name: UI_COOKIE_NAME,
    value: SIGNAL_COOKIE_VALUE,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

function clearSignalCookie(response: NextResponse) {
  response.cookies.set({
    name: UI_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

function redirectWithinCurrentOrigin(request: NextRequest, url: URL) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || "";
  const isLocalHost = /^(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/.test(requestHost);
  const origin = isLocalHost
    ? `${request.nextUrl.protocol}//${requestHost}`
    : PRODUCTION_ORIGIN;
  const destination = new URL(`${url.pathname}${url.search}`, origin);

  return NextResponse.redirect(destination, 307);
}

function varyOnUiCookie(response: NextResponse) {
  response.headers.append("Vary", "Cookie");
  return response;
}

export function middleware(request: NextRequest) {
  const requestedMode = request.nextUrl.searchParams.get("ui");
  const hasSignalCookie =
    request.cookies.get(UI_COOKIE_NAME)?.value === SIGNAL_COOKIE_VALUE;
  const isSignalPath =
    request.nextUrl.pathname === SIGNAL_PREFIX ||
    request.nextUrl.pathname.startsWith(`${SIGNAL_PREFIX}/`);

  if (requestedMode === "signal" || requestedMode === "classic") {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = toCanonicalPath(cleanUrl.pathname);
    cleanUrl.searchParams.delete("ui");

    const response = redirectWithinCurrentOrigin(request, cleanUrl);

    if (requestedMode === "signal") {
      setSignalCookie(response);
    } else {
      clearSignalCookie(response);
    }

    return response;
  }

  if (isSignalPath) {
    if (hasSignalCookie) {
      return varyOnUiCookie(NextResponse.next());
    }

    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = toCanonicalPath(canonicalUrl.pathname);

    const response = redirectWithinCurrentOrigin(request, canonicalUrl);
    setSignalCookie(response);
    return response;
  }

  if (!isCanonicalPage(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!hasSignalCookie) {
    return varyOnUiCookie(NextResponse.next());
  }

  const signalUrl = request.nextUrl.clone();
  // TLS terminates at the reverse proxy. Next itself listens on loopback HTTP,
  // so an internal rewrite must not inherit X-Forwarded-Proto=https or it will
  // attempt a TLS request against the plain HTTP app port.
  signalUrl.protocol = "http:";
  signalUrl.pathname =
    request.nextUrl.pathname === "/"
      ? SIGNAL_PREFIX
      : `${SIGNAL_PREFIX}${request.nextUrl.pathname}`;

  return varyOnUiCookie(NextResponse.rewrite(signalUrl));
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/archive",
    "/blog/:path*",
    "/categories/:path*",
    "/collaboration",
    "/methodology",
    "/projects",
    "/tags/:path*",
    "/topics/:path*",
    "/signal-preview/:path*"
  ]
};
