import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Fetch current user session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define route protection rules
  const isOwnerRoute = pathname.startsWith("/owner");
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentProtectedRoute = [
    "/visits",
    "/bookings",
    "/my-stay",
    "/payments",
    "/complaints",
    "/reviews",
    "/account",
    "/compare",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const isAuthRoute = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  // If user is accessing a protected route without being authenticated
  if ((isOwnerRoute || isAdminRoute || isStudentProtectedRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access login/signup pages
  if (user && isAuthRoute) {
    const userRole = user.user_metadata?.role || "tenant";
    const redirectUrl = request.nextUrl.clone();
    if (userRole === "admin") {
      redirectUrl.pathname = "/admin/dashboard";
    } else if (userRole === "owner") {
      redirectUrl.pathname = "/owner/dashboard";
    } else {
      redirectUrl.pathname = "/account";
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Role-Based Authorization Checks
  if (user) {
    const userRole = user.user_metadata?.role || "tenant";

    // Owner Route Protection: Only owners and admins allowed
    if (isOwnerRoute && userRole !== "owner" && userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/unauthorized";
      return NextResponse.redirect(redirectUrl);
    }

    // Admin Route Protection: Only admins allowed
    if (isAdminRoute && userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/unauthorized";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
