import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/national-committee",
  "/national-committee/(.*)",
  "/api/webhooks(.*)",
  "/portal/signin(.*)",
  "/portal/signup(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  console.log(`Middleware: ${req.method} ${req.nextUrl.pathname}`);

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
