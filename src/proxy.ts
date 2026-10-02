import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/@([a-zA-Z0-9._]+)$/);
  if (!match) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/creator/${match[1]}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media).*)"],
};
