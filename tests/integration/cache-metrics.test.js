"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests/integration/cache-metrics.test.ts
const setup_1 = require("./setup");
const articleService_1 = require("../../src/services/articleService");
const l1Cache_1 = require("../../src/cache/l1Cache");
describe("Cache metrics (L1/L2/db)", () => {
    it("increases db, L1, and L2 counters across requests", async () => {
        const seeded = await (0, articleService_1.seedArticle)({
            id: "article-metrics-1",
            title: "Metrics test article",
            body: "Metrics test body",
        });
        const id = seeded.id;
        const before = (0, articleService_1.getCacheMetrics)();
        // First request: DB
        await (0, setup_1.api)().get(`/articles/${id}`);
        // Second request: L1 (memory)
        await (0, setup_1.api)().get(`/articles/${id}`);
        // Clear L1 and hit again: Redis
        (0, l1Cache_1.invalidateArticleInL1)(id);
        await (0, setup_1.api)().get(`/articles/${id}`);
        const after = (0, articleService_1.getCacheMetrics)();
        // We don't require exact counts, just that they increase appropriately
        expect(after.counters.dbHits).toBeGreaterThanOrEqual(before.counters.dbHits + 1);
        expect(after.counters.l1Hits).toBeGreaterThanOrEqual(before.counters.l1Hits + 1);
        expect(after.counters.l2Hits).toBeGreaterThanOrEqual(before.counters.l2Hits + 1);
    });
});
