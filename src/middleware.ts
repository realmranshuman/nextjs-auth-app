import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnAuthPage = req.nextUrl.pathname.startsWith("/auth");

    // Redirect authenticated users away from auth pages
    if (isLoggedIn && isOnAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // Redirect unauthenticated users to sign in
    if (!isLoggedIn && isOnDashboard) {
        return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};
