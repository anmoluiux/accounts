import { NextResponse } from "next/server";
import { redis } from "@/src/lib/redis";

export async function POST(request: Request) {
  try {
    const { subdomain, config } = await request.json();

    if (!subdomain || !config) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const redisKey = `tenant_config:${subdomain}`;

    // Store the config in Redis
    await redis.set(redisKey, JSON.stringify(config));

    console.log(`✅ Config pushed to Redis via separate API: ${redisKey}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
