// app/api/seed/route.ts
import { prisma } from "@/src/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Create a Lead (Pre-registration)
    const newLead = await prisma.lead.create({
      data: {
        email: "test3@example.com",
        siteName: "My Awesome Flower Shop",
        siteType: "E-commerce",
        description: "A minimal shop for rare orchids",
        features: ["Dark Mode", "Payment Gateway"],
      },
    });

    // 2. Create a User (Registered)
    const newUser = await prisma.user.create({
      data: {
        email: "admin@anmol2.com",
        passwordHash: "hashed_secret_password_123", // In real app, hash this!
        fullName: "Jane Doe",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data seeded successfully!",
      lead: newLead,
      user: newUser,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
