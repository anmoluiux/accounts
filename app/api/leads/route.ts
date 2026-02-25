// app/api/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma/prisma";

// 1. CREATE (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Remove leadId from body if it exists (shouldn't be there for create, but just in case)
    const { leadId, businessName, ...data } = body;

    const newLead = await prisma.lead.create({ data });
    return NextResponse.json({ success: true, leadId: newLead.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. UPDATE (PATCH)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leadId, businessName, ...data } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required for update" }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data,
    });
    return NextResponse.json({ success: true, leadId: updatedLead.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
