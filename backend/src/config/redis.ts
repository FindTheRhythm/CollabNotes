import { Redis } from "ioredis";
import { config } from "./index.js";

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected");
});

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCachedData<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(data));
}

export async function deleteCachedData(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
