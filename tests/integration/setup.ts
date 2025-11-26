// tests/integration/setup.ts
import request from "supertest";
import app, { setHealthStatus } from "../../src/app";
import { connectMongo } from "../../src/db/mongoClient";
import { createClient } from "redis";
import { setRedisClient, AppRedisClient } from "../../src/cache/redisCache";

export const api = () => request(app);

let redisClient: AppRedisClient | null = null;

beforeAll(async () => {
  await connectMongo();

  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis error in tests:", err);
  });

  await redisClient.connect();

  setRedisClient(redisClient);

  setHealthStatus({ mongo: true, redis: true });
});

beforeEach(async () => {
  if (redisClient) {
    await redisClient.flushAll();
  }
});

afterAll(async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});
