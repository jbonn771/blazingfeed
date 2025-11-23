BlazingFeed – Multi-Layer Caching Service (L1 + L2) with MongoDB & Redis

A backend service designed to teach and demonstrate real production engineering concepts, including:

Layered caching architecture (L1 in-memory + L2 Redis)

Cache-aside pattern

Cache warming & invalidation

Separation of concerns (routes, services, repos, cache modules)

Service healthchecks & dependency monitoring

Metrics for cache hit ratios

Running a multi-service environment with Docker Compose

Express + TypeScript backend structuring

This project simulates a real-world, read-heavy service (e.g., articles, feed items, feature flags) and shows how to scale it by reducing database load and improving latency.

🎓 Concepts You Will Learn from This Project

🚦 1. L1/L2 Caching Architecture

You’ll learn how high-scale systems reduce latency by layering caches:

L1 (In-Memory LRU Cache):
Fastest possible access — kept per instance.

L2 (Redis Distributed Cache):
Shared across multiple instances for horizontal scaling.

This mirrors architectures used at companies like Netflix, Twitter, Meta, DoorDash, etc.

🧠 2. Cache-Aside Pattern (Industry Standard)

This project teaches the exact caching strategy used in production:

L1 → L2 → DB


If a key misses:

Read from DB

Write to Redis (L2)

Write to in-memory (L1)

This pattern:

avoids stale cache problems

keeps DB load minimal

enables graceful fallback if Redis fails

⚡️ 3. Cache Hit Ratio Metrics

You will implement and analyze:

l1Hits, l1Misses

l2Hits, l2Misses

dbHits

And expose them through:

GET /metrics


This teaches how real systems measure efficiency and optimize performance.

🏗 4. Clean Backend Architecture

This project forces you to learn proper backend layering:

routes → services → repositories → cache → db


You will understand how to split:

HTTP layer

Business logic

Persistence logic

Cache adapters

Environment setup

This is exactly what senior engineers look for.

🐳 5. Running Multi-Service Dev Environments with Docker

You will run:

Node API

MongoDB

Redis

using a single docker-compose up.

This teaches you:

container networking

environment variables

dependency orchestration

realistic local development setups


🟢 6. Health Checks & Infrastructure Awareness

The project includes a /health route that reports:

Redis connected or not

Mongo connected or not

Overall service degraded or healthy

This is how real services work inside AWS, Kubernetes, GCP, etc.


🚀 Features

L1 in-memory cache (LRU)

L2 Redis distributed cache

Cache-aside pattern

Cache warm + invalidate

MongoDB repository layer

Metrics & hit ratios

Clean module structure

Express + TypeScript

Docker Compose setup

🧱 Architecture
             ┌──────────────┐
             │    Client     │
             └──────┬───────┘
                    │
              HTTP Requests
                    │
            ┌───────▼────────┐
            │   Express API   │
            └───────┬────────┘
          L1 Check  │
        (in-memory) │
                    ▼
        ┌──────────────────┐
        │    Redis (L2)    │
        └──────────────────┘
                    │ miss
                    ▼
           ┌────────────────┐
           │   MongoDB      │
           └────────────────┘

📦 Project Structure
blazingfeed/
  docker-compose.yml
  Dockerfile
  package.json
  README.md
  src/
    index.ts
    routes/
      articleRoutes.ts
    services/
      articleService.ts
    db/
      mongoClient.ts
      articleRepo.ts
    cache/
      l1Cache.ts
      redisCache.ts

🐳 Running with Docker (recommended)
docker-compose up --build


Health check:

curl http://localhost:3000/health

🧪 API Endpoints
Seed an article
POST /seed

Get an article (with meta: memory/redis/db)
GET /articles/:id

Cache metrics
GET /metrics

