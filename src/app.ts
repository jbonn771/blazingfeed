import express, { Request, Response } from "express";
import { registerArticleRoutes } from "./routes/articleRoutes";

export const app = express();
app.use(express.json());


let mongoConnected = false;
let redisConnected = false;

export function setHealthStatus(options: { mongo: boolean; redis: boolean }) {
  mongoConnected = options.mongo;
  redisConnected = options.redis;
}


app.get("/health", (_req: Request, res: Response) => {
  const statusOk = mongoConnected && redisConnected;

  res.json({
    status: statusOk ? "ok" : "degraded",
    mongo: mongoConnected ? "connected" : "disconnected",
    redis: redisConnected ? "connected" : "disconnected",
  });
});


registerArticleRoutes(app);

export default app;
