import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/src/prisma/prisma";
import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// Helper function to generate a unique subdomain/site name
async function generateUniqueSubdomain(baseName: string): Promise<string> {
  // 1. Clean the name: remove spaces, special chars, make lowercase
  let candidate = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let isUnique = false;
  let attempt = 0;

  // 2. Loop until we find a unique name
  while (!isUnique) {
    // If it's not the first attempt, append a random 4-digit number
    const currentName = attempt === 0 ? candidate : `${candidate}${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Check database for existing site with this subdomain
    // Note: Assuming your Site model has a 'subdomain' or 'name' field that needs to be unique
    const existingSite = await prisma.site.findFirst({
      where: {
        subdomain: currentName,
      },
    });

    if (!existingSite) {
      return currentName; // Found a free one!
    }

    attempt++;
  }
  return candidate; // Fallback (should not be reached due to loop)
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, siteName, siteType, description } = body;

    // 1. Validate Input
    if (!email || !password || !siteName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if User already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    // 3. Generate Unique Site Subdomain
    const uniqueSubdomain = await generateUniqueSubdomain(siteName);

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User AND Site in one transaction
    // This ensures if site creation fails, the user isn't created (and vice versa)
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the User & Site
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName: "AnyName", // Optional based on your schema
          sites: {
            create: {
              name: siteName, // The display name (can be duplicate)
              subdomain: uniqueSubdomain, // The unique ID (e.g. alice-bakery-4829)
              type: siteType, // "fashion", "restaurant", etc.
              description: description,
              config: {
                db_hostname: "db",
                db_username: "root",
                db_password: "root_password",
                db_database: uniqueSubdomain,
                db_port: "3306",
                db_prefix: "oc_",
                s3_prefix: uniqueSubdomain,
              },
            },
          },
        },
        include: {
          sites: true,
        },
      });

      // B. Find and Update the Lead (Link logic)
      // We use updateMany in case the user submitted the lead form multiple times
      await tx.lead.updateMany({
        where: { email: email },
        data: {
          isConverted: true,
          convertedUserId: newUser.id,
        },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "User created and Lead converted",
      user: result,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
