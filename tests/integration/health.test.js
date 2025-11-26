"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("./setup");
describe("GET /health", () => {
    it("returns ok when Mongo and Redis are connected", async () => {
        const res = await (0, setup_1.api)().get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            status: "ok",
            mongo: "connected",
            redis: "connected",
        });
    });
});
