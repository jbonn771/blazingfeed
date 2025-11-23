import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blazingfeed";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "blazingfeed";


export async function connectMongo(): Promise<Db> {
  if (db) {
    return db; 
  }

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(MONGO_DB_NAME);

  console.log(`Connected to MongoDB: ${MONGO_URI}/${MONGO_DB_NAME}`);
  return db;
}


export function getDb(): Db {
  if (!db) {
    throw new Error("MongoDB not connected.");
  }
  return db;
}


export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed.");
  }
}
