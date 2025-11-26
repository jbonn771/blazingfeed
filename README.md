BlazingFeed – Multi-Layer Caching Service (L1 + L2) with MongoDB & Redis

BlazingFeed is a backend service built to demonstrate real production engineering concepts, including:

Layered caching (L1 in-memory + L2 Redis)

Cache-aside pattern

Cache warming and invalidation

Separation of concerns (routes, services, repos, cache modules)

Service health checks and dependency monitoring

Cache hit ratio metrics

Multi-service development using Docker Compose

Express + TypeScript backend architecture

This project simulates a real-world, read-heavy service (such as an article feed, feature flag store, or content lookup service) and shows how to scale it by reducing database load and improving latency.

Concepts Covered
1. L1/L2 Caching Architecture

High-scale systems reduce latency and load by layering caches:

L1 (in-memory): fastest access, private to each instance

L2 (Redis): shared distributed cache that supports horizontal scaling

This mirrors real architectures used at companies such as Netflix, Meta, Twitter, DoorDash, and others.

2. Cache-Aside Pattern

This project demonstrates the industry-standard cache-aside workflow:

Check L1

If miss, check L2

If miss, read from DB

Write fresh value into Redis (L2)

Write into in-memory L1

This avoids stale cache problems, reduces DB load, and provides graceful fallback if Redis fails.

3. Cache Hit Ratio Metrics

The system tracks and reports:

L1 hits and misses

L2 hits and misses

DB hits

Metrics are available through:

GET /metrics


These measurements are essential for optimizing large-scale systems.

4. Clean Backend Architecture

The project is structured into clear layers:

routes -> services -> repositories -> cache -> db


This encourages maintainability and mirrors real-world application architecture.

5. Multi-Service Environment with Docker Compose

You will run:

Node API

MongoDB

Redis

in a single coordinated environment using Docker Compose. This demonstrates container networking, dependency orchestration, and realistic local development practices.

6. Health Checks and Dependency Awareness

The application includes a /health endpoint that reports:

MongoDB connection status

Redis connection status

Overall system health

This type of endpoint is standard in AWS, Kubernetes, and other deployment environments.

Features

L1 in-memory caching (LRU-style logic)

L2 Redis caching

Cache-aside pattern implementation

Cache warm and invalidate paths

MongoDB repository layer

Cache metrics and hit ratio reporting

Clean Express + TypeScript structure

Full Docker Compose development environment

Integration test suite (Mongo + Redis in containers)


             +-------------+
             |   Client    |
             +------+------+
                    |
              HTTP Requests
                    |
            +-------v-------+
            |  Express API  |
            +-------+-------+
            L1 Check |
           (in-memory)
                    v
        +---------------------+
        |    Redis (L2)       |
        +---------------------+
                    | miss
                    v
           +------------------+
           |    MongoDB       |
           +------------------+

Project Structure
blazingfeed/
  docker-compose.yml
  Dockerfile
  package.json
  README.md
  src/
    app.ts
    server.ts
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
  tests/
    integration/
      setup.ts
      health.test.ts
      article-cache-flow.test.ts
      cache-metrics.test.ts

Running With Docker (Recommended)

This project includes fully containerized integration tests that run against real MongoDB and Redis.

1. Start infrastructure (Mongo and Redis)
docker compose up -d mongo redis

2. Run integration tests inside the test container

(If tests fail, the exit code will be non-zero.)

docker compose run --rm test

3. Build the application image only if tests pass
docker compose build app

API Endpoints
Seed an article
POST /seed

Get an article (returns meta: memory/redis/db)
GET /articles/:id

Cache metrics
GET /metrics

Health Check
GET /health
curl http://localhost:3000/health
