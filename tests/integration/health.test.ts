import { api } from "./setup";

describe("GET /health", () => {
  it("returns ok when Mongo and Redis are connected", async () => {
    const res = await api().get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      mongo: "connected",
      redis: "connected",
    });
  });
});