// tests/integration/cache-metrics.test.ts
import { api } from "./setup";
import { seedArticle, getCacheMetrics } from "../../src/services/articleService";
import { invalidateArticleInL1 } from "../../src/cache/l1Cache";

describe("Cache metrics (L1/L2/db)", () => {
  it("increases db, L1, and L2 counters across requests", async () => {
    const seeded = await seedArticle({
      id: "article-metrics-1",
      title: "Metrics test article",
      body: "Metrics test body",
    });

    const id = seeded.id;

    const before = getCacheMetrics();

    // First request: DB
    await api().get(`/articles/${id}`);

    // Second request: L1 (memory)
    await api().get(`/articles/${id}`);

    // Clear L1 and hit again: Redis
    invalidateArticleInL1(id);
    await api().get(`/articles/${id}`);

    const after = getCacheMetrics();

    // We don't require exact counts, just that they increase appropriately
    expect(after.counters.dbHits).toBeGreaterThanOrEqual(before.counters.dbHits + 1);
    expect(after.counters.l1Hits).toBeGreaterThanOrEqual(before.counters.l1Hits + 1);
    expect(after.counters.l2Hits).toBeGreaterThanOrEqual(before.counters.l2Hits + 1);
  });
});
