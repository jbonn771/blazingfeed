import {
  Article,
  findArticleById,
  upsertArticle,
} from "../db/articleRepo";
import {
  getArticleFromL1,
  setArticleInL1,
  invalidateArticleInL1,
  getL1Metrics,
} from "../cache/l1Cache";
import {
  getArticleFromRedis,
  setArticleInRedis,
  invalidateArticleInRedis,
  getL2Metrics,
} from "../cache/redisCache";

export interface ArticleWithMeta extends Article {
  meta: {
    source: "memory" | "redis" | "db";
  };
}

// DB hit metric
let dbHits = 0;

/**
 * Read path: L1 (memory) -> L2 (Redis) -> DB
 */
export async function getArticle(id: string): Promise<{
  article: ArticleWithMeta | null,
  source: "memory" | "redis" | "db";
}> {
  // 1) L1
  const fromL1 = getArticleFromL1(id);
  if (fromL1) {
    return { article: { ...fromL1, meta: { source: "memory" } }, source: "memory" };
  }

  // 2) L2 (Redis)
  const fromRedis = await getArticleFromRedis(id);
  if (fromRedis) {
    // warm L1
    setArticleInL1(fromRedis);
    return { article: { ...fromRedis, meta: { source: "redis" } }, source: "redis" };
  }

  // 3) DB
  const fromDb = await findArticleById(id);
  if (!fromDb) return { article: null, source: "db" };

  dbHits++;

  // warm L2 + L1
  await setArticleInRedis(fromDb);
  setArticleInL1(fromDb);

  return { article: { ...fromDb, meta: { source: "db" } }, source: "db" };
}

/**
 * Seed or update an article
 */
export async function seedArticle(input: {
  id: string;
  title: string;
  body: string;
  tags?: string[];
}): Promise<ArticleWithMeta> {
  const article: Article = {
    id: String(input.id),
    title: input.title,
    body: input.body,
    tags: input.tags || [],
    updatedAt: new Date().toISOString(),
  };

  await upsertArticle(article);

  // Invalidate caches so next read refreshes properly
  invalidateArticleInL1(article.id);
  await invalidateArticleInRedis(article.id);

  return { ...article, meta: { source: "db" } };
}

/**
 * Metrics for /metrics endpoint
 */
export function getCacheMetrics() {
  const l1 = getL1Metrics();
  const l2 = getL2Metrics();

  return {
    l1HitRatio: l1.l1HitRatio,
    l2HitRatio: l2.l2HitRatio,
    counters: {
      l1Hits: l1.l1Hits,
      l1Misses: l1.l1Misses,
      l2Hits: l2.l2Hits,
      l2Misses: l2.l2Misses,
      dbHits,
    },
  };
}
