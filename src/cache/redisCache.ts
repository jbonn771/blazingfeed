import type { RedisClientType } from "redis";
import type { Article } from "../db/articleRepo";

let redisClient: RedisClientType | null = null;

// Metrics
let l2Hits = 0;
let l2Misses = 0;

const keyFor = (id: string) => `article:${id}`;

export function setRedisClient(client: RedisClientType) {
  redisClient = client;
}

export async function getArticleFromRedis(id: string): Promise<Article | null> {
  if (!redisClient) {
    throw new Error("Redis client not set. Call setRedisClient() first.");
  }

  const key = keyFor(id);
  const raw = await redisClient.get(key);

  if (!raw) {
    l2Misses++;
    return null;
  }

  try {
    const article = JSON.parse(raw) as Article;
    l2Hits++;
    return article;
  } catch {
    l2Misses++;
    return null;
  }
}

export async function setArticleInRedis(article: Article, ttlSeconds = 600): Promise<void> {
  if (!redisClient) {
    throw new Error("Redis client not set. Call setRedisClient() first.");
  }

  const key = keyFor(article.id);
  await redisClient.set(key, JSON.stringify(article), {
    EX: ttlSeconds,
  });
}

export async function invalidateArticleInRedis(id: string): Promise<void> {
  if (!redisClient) {
    throw new Error("Redis client not set. Call setRedisClient() first.");
  }

  const key = keyFor(id);
  await redisClient.del(key);
}

export function getL2Metrics() {
  const total = l2Hits + l2Misses || 1;
  return {
    l2Hits,
    l2Misses,
    l2HitRatio: l2Hits / total,
  };
}
