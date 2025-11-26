import { createClient } from "redis";
import { connectMongo } from "./db/mongoClient";
import { setRedisClient } from "./cache/redisCache";
import app, { setHealthStatus } from "./app";


const PORT = Number(process.env.PORT || 3000);
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

async function start() {
  let mongoConnected = false;
  let redisConnected = false;


  try {
    await connectMongo();
    mongoConnected = true;
  } catch (err) {
    mongoConnected = false;
    console.error("Mongo connection failed:", err);
  }


  const redisClient = createClient({
    socket: { host: REDIS_HOST, port: REDIS_PORT },
  });

  redisClient.on("error", (err) => console.error("Redis error:", err));

  try {
    await redisClient.connect();
    redisConnected = true;
    setRedisClient(redisClient);
  } catch (err) {
    redisConnected = false;
    console.error("Redis connection failed:", err);
  }


  setHealthStatus({ mongo: mongoConnected, redis: redisConnected });


  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
