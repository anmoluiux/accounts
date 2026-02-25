import { NextResponse } from "next/server";
import { redis } from "@/src/lib/redis";

export async function GET() {
  try {
    // 1. Try to write data
    await redis.set("test_connection", "Success! Next.js connected to Redis.");

    // 2. Try to read it back
    const value = await redis.get("test_connection");

    // 3. Return the result
    return NextResponse.json({
      success: true,
      message: "Redis is connected 🟢",
      valueFromRedis: value,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Redis connection failed 🔴",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
