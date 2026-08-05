import { Redis } from "@upstash/redis";

const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

export const redis =
  url && token
    ? new Redis({
        url,
        token,
      })
    : null;

/**
 * Gets cached room catalog from Redis for a user & profile version.
 * Key format: room-catalog:{userId}:{profileVersion}
 */
export async function getCachedRoomCatalog(
  userId: string,
  profileVersion: number = 1
): Promise<any[] | null> {
  if (!redis || !userId) return null;
  try {
    const key = `room-catalog:${userId}:${profileVersion}`;
    const cached = await redis.get<any[]>(key);
    return cached || null;
  } catch (e) {
    return null;
  }
}

/**
 * Sets cached room catalog in Redis with 1h TTL (3600 seconds).
 * Key format: room-catalog:{userId}:{profileVersion}
 */
export async function setCachedRoomCatalog(
  userId: string,
  profileVersion: number = 1,
  rooms: any[]
): Promise<boolean> {
  if (!redis || !userId || !Array.isArray(rooms)) return false;
  try {
    const key = `room-catalog:${userId}:${profileVersion}`;
    await redis.set(key, rooms, { ex: 3600 }); // 1 hour TTL (EX)
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Gets a generic cached item from Redis.
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get<T>(key);
    return cached || null;
  } catch (e) {
    return null;
  }
}

/**
 * Sets a generic cached item in Redis with an optional TTL (in seconds, default 600s / 10m).
 */
export async function setCachedData(key: string, value: any, ttlSeconds = 600): Promise<boolean> {
  if (!redis || !value) return false;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (e) {
    return false;
  }
}
