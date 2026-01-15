import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    const isAuth = !!sessionCookie;

    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith("/login");
    const isDashboardPage = pathname.startsWith("/dashboard");

    if (isAuthPage) {
        if (isAuth) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    if (isDashboardPage) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
