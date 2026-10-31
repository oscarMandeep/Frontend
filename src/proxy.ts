import { NextResponse, type NextRequest } from "next/server";

const APP_PATHS = [
  "/discover",
  "/matches",
  "/chat",
  "/sessions",
  "/chains",
  "/wallet",
  "/profile",
  "/onboarding",
];

// Cheap gate only: checks that a session cookie exists. Real authorization
// is always done by the API.
export function proxy(req: NextRequest) {
  const isApp = APP_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  const hasSession = req.cookies.has("ss_at") || req.cookies.has("ss_rt");
  if (isApp && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|internal|.*\\..*).*)"] };
