import { Db, Collection } from "mongodb";
import { getDb } from "./mongoClient";

// Domain model for an article
export interface Article {
  id: string;       
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
}


function getArticleCollection(): Collection<Article> {
  const db: Db = getDb();
  return db.collection<Article>("articles");
}


export async function findArticleById(id: string): Promise<Article | null> {
  const collection = getArticleCollection();
  const article = await collection.findOne({ id });
  return article;
}


export async function upsertArticle(article: Article): Promise<void> {
  const collection = getArticleCollection();
  await collection.updateOne(
    { id: article.id },
    { $set: article },
    { upsert: true }
  );
}


export async function deleteArticle(id: string): Promise<void> {
  const collection = getArticleCollection();
  await collection.deleteOne({ id });
}

export async function listRecentArticles(limit: number = 10): Promise<Article[]> {
  const collection = getArticleCollection();
  const cursor = collection
    .find({})
    .sort({ updatedAt: -1 })
    .limit(limit);

  return cursor.toArray();
}
