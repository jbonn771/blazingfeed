// tests/integration/article-cache-flow.test.ts
import { api } from "./setup";
import { seedArticle } from "../../src/services/articleService";
import { invalidateArticleInL1 } from "../../src/cache/l1Cache";

describe("Article cache flow: L1 (memory) -> L2 (Redis) -> DB", () => {
  it("serves from db, then memory, then redis when L1 is cleared", async () => {
    const seeded = await seedArticle({
      id: "article-1",
      title: "Cache test article",
      body: "Hello from integration test",
      tags: ["test"],
    });

    const id = seeded.id;

    // 1) First request: DB
    const res1 = await api().get(`/articles/${id}`);
    expect(res1.status).toBe(200);
    expect(res1.get("X-Article-Source")).toBe("db");
    expect(res1.body.id).toBe(id);
    expect(res1.body.meta.source).toBe("db");

    // 2) Second request: L1 (memory)
    const res2 = await api().get(`/articles/${id}`);
    expect(res2.status).toBe(200);
    expect(res2.get("X-Article-Source")).toBe("memory");
    expect(res2.body.meta.source).toBe("memory");

    // 3) Clear L1 only
    invalidateArticleInL1(id);

    // 4) Third request: Redis
    const res3 = await api().get(`/articles/${id}`);
    expect(res3.status).toBe(200);
    expect(res3.get("X-Article-Source")).toBe("redis");
    expect(res3.body.meta.source).toBe("redis");
  });
});
