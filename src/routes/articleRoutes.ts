import { Application, Request, Response, NextFunction } from "express";
import {
  getArticle,
  seedArticle,
  getCacheMetrics,
} from "../services/articleService";


function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function registerArticleRoutes(app: Application) {
  app.post(
    "/seed",
    asyncHandler(async (req: Request, res: Response) => {
      const { id, title, body, tags } = req.body;

      if (!id || !title || !body) {
        return res
          .status(400)
          .json({ error: "id, title, and body are required" });
      }

      const article = await seedArticle({ id, title, body, tags });
      res.status(201).json({ message: "Seeded article", article });
    })
  );

  // Get article by id 
  app.get(
    "/articles/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id;
      const { article, source } = await getArticle(id);
      res.setHeader("x-article-source", source);

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      res.json(article);
    })
  );

  // Metrics: cache hit ratios + counters
  app.get(
    "/metrics",
    asyncHandler(async (_req: Request, res: Response) => {
      const metrics = getCacheMetrics();
      res.json(metrics);
    })
  );
}
