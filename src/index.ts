import express, { Request, Response } from "express";
import { createClient, RedisClientType } from "redis";
import { connectMongo } from "./db/mongoClient";
import { setRedisClient } from "./cache/redisCache";
import { registerArticleRoutes } from "./routes/articleRoutes";

// Environment
const PORT = Number(process.env.PORT || 3000);

// Redis
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

// Globals
let redisClient: RedisClientType;
let mongoConnected = false;

// Initialize Express
const app = express();
app.use(express.json());

// Health Check Route (infra concern)
app.get("/health", (_req: Request, res: Response) => {
  const redisOk = redisClient && redisClient.isOpen;
  const statusOk = mongoConnected && redisOk;

  res.json({
    status: statusOk ? "ok" : "degraded",
    mongo: mongoConnected ? "connected" : "disconnected",
    redis: redisOk ? "connected" : "disconnected",
  });
});

// Register domain routes (articles)
registerArticleRoutes(app);

// Start Server
async function start() {
  // 1. Connect to Mongo
  console.log("Connecting to MongoDB...");
  try {
    await connectMongo();
    mongoConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    mongoConnected = false;
    console.error("Failed to connect to MongoDB:", err);

  }

  // 2. Connect to Redis
  console.log("Connecting to Redis...");
  redisClient = createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await redisClient.connect();
  console.log("Connected to Redis");


  setRedisClient(redisClient);

  // 3. Start HTTP server
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
