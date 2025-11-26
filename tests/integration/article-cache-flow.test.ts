// tests/integration/article-cache-flow.test.ts
import { api } from "./setup";
import { seedArticle } from "../../src/services/articleService";
import { invalidateArticleInL1 } from "../../src/cache/l1Cache";

describe("Article cache flow: L1 (memory) -> L2 (Redis) -> DB", () => {
  it("serves from db, then memory, then redis when L1 is cleared", async () => {
    // 1) Seed article (writes to DB, invalidates caches)
    const seeded = await seedArticle({
      id: "article-1",
      title: "Cache test article",
      body: "Hello from integration test",
      tags: ["test"],
    });

    const id = seeded.id;

    // 2) First request – should hit DB (L1 miss, L2 miss)
    const res1 = await api().get(`/articles/${id}`);
    expect(res1.status).toBe(200);
    expect(res1.headers["x-article-source"]).toBe("db");
    expect(res1.body.id).toBe(id);
    expect(res1.body.meta.source).toBe("db");

    // At this point: DB was used, and both L2 + L1 should be warmed.

    // 3) Second request – should be served from L1 (memory)
    const res2 = await api().get(`/articles/${id}`);
    expect(res2.status).toBe(200);
    expect(res2.headers["x-article-source"]).toBe("memory");
    expect(res2.body.meta.source).toBe("memory");

    // 4) Clear only L1 (memory), keep Redis warm
    invalidateArticleInL1(id);

    // 5) Third request – L1 miss, L2 (Redis) hit
    const res3 = await api().get(`/articles/${id}`);
    expect(res3.status).toBe(200);
    expect(res3.headers["x-article-source"]).toBe("redis");
    expect(res3.body.meta.source).toBe("redis");
  });
});
