import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain");

  if (!subdomain || subdomain.length < 3) {
    return NextResponse.json({ available: false, error: "Too short" });
  }

  // Sanitize: allow only lowercase letters, numbers, and hyphens
  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  if (cleanSubdomain !== subdomain) {
    return NextResponse.json({ available: false, error: "Invalid characters" });
  }

  // Check Sites table (Final Source of Truth)
  const existingSite = await prisma.site.findUnique({
    where: { subdomain: cleanSubdomain },
  });

  return NextResponse.json({ available: !existingSite });
}
