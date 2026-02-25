import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma/prisma";
// ... keep imports for fetch/php trigger ...

export async function POST(request: Request) {
  try {
    const { siteId, dbName } = await request.json();

    if (!siteId || !dbName) return NextResponse.json({ error: "Missing Data" }, { status: 400 });

    // 1. CHECK STATUS FIRST (The "Refresh" Guard)
    const site = await prisma.site.findUnique({ where: { id: siteId } });

    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    // If already done, return success immediately
    if (site.status === "COMPLETED") {
      return NextResponse.json({ success: true, message: "Already completed" });
    }

    // If currently building, tell frontend to just wait
    if (site.status === "BUILDING") {
      return NextResponse.json({ success: true, message: "Build in progress" });
    }

    // 2. MARK AS BUILDING
    await prisma.site.update({
      where: { id: siteId },
      data: { status: "BUILDING" },
    });

    // 3. RUN THE HEAVY SCRIPT (PHP Trigger)
    const phpPort = "8080"; // Check your docker-compose
    const secretKey = "MY_SUPER_SECRET_KEY";
    const phpTriggerUrl = `http://localhost:${phpPort}/provision.php?key=${secretKey}&db_name=${dbName}`;

    const response = await fetch(phpTriggerUrl);
    const text = await response.text();

    if (response.ok && text.includes("Success")) {
      // 4. MARK AS COMPLETED
      await prisma.site.update({
        where: { id: siteId },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ success: true });
    } else {
      // MARK AS FAILED
      await prisma.site.update({
        where: { id: siteId },
        data: { status: "FAILED" },
      });
      throw new Error(text);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
