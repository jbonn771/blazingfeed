import { LRUCache } from "lru-cache";
import type { Article } from "../db/articleRepo";

const l1 = new LRUCache<string, Article>({
  max: 1000,        // max items
  ttl: 1000 * 60,   // 1 minute TTL (optional)
});

// Metrics (optional)
let l1Hits = 0;
let l1Misses = 0;

const keyFor = (id: string) => `article:${id}`;

export function getArticleFromL1(id: string): Article | null {
  const key = keyFor(id);
  const value = l1.get(key) || null;

  if (value) l1Hits++;
  else l1Misses++;

  return value;
}

export function setArticleInL1(article: Article): void {
  const key = keyFor(article.id);
  l1.set(key, article);
}

export function invalidateArticleInL1(id: string): void {
  const key = keyFor(id);
  l1.delete(key);
}

export function getL1Metrics() {
  const total = l1Hits + l1Misses || 1;
  return {
    l1Hits,
    l1Misses,
    l1HitRatio: l1Hits / total,
  };
}
