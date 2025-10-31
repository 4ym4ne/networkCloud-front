import { NextRequest, NextResponse } from "next/server";

import { addSecurityHeaders, authorizeRequest, isPublicPath } from "./utils";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  const authDecision = await authorizeRequest(req, pathname);
  if (authDecision) {
    return addSecurityHeaders(authDecision);
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
