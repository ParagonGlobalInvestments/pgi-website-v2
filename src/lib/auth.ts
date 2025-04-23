import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Function to redirect unauthorized users
export function handleUnauthorized(returnTo = "/portal/dashboard") {
  return NextResponse.redirect(
    new URL(returnTo, process.env.NEXT_PUBLIC_APP_URL || "")
  );
}

// Check if the current user has admin role
export async function isAdmin() {
  const session = await auth();
  return session?.sessionClaims?.role === "admin";
}

// Check if the current user has lead role or higher
export async function isLeadOrAdmin() {
  const session = await auth();
  return ["admin", "lead"].includes(
    (session?.sessionClaims?.role as string) || ""
  );
}

// Check if user is from a specific chapter
export async function isFromChapter(chapter: string) {
  const session = await auth();
  return session?.sessionClaims?.chapter === chapter;
}

// Check if user belongs to a specific track
export async function isInTrack(track: string) {
  const session = await auth();
  return session?.sessionClaims?.track === track || track === "both";
}

// Types for role and track
export type UserRole = "admin" | "lead" | "member";
export type UserTrack = "quant" | "value" | "both";

// Get user metadata
export async function getUserMetadata() {
  const session = await auth();

  return {
    role: (session?.sessionClaims?.role as UserRole) || "member",
    track: (session?.sessionClaims?.track as UserTrack) || "value",
    chapter: (session?.sessionClaims?.chapter as string) || "Yale University",
    isManager: session?.sessionClaims?.isManager || false,
    isAlumni: session?.sessionClaims?.isAlumni || false,
  };
}
