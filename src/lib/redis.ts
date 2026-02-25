import Redis from "ioredis";

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: "localhost", // Connects to your Docker container via host
    port: 6379,
    // password: "your_redis_password", // Uncomment if you set a password in Docker
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
