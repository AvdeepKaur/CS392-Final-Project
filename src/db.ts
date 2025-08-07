//avdeep
import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not set");
}

console.log(MONGO_URI);

const DB_NAME = "final_project";
export const COLLECTION_NAME = "locations";

let client: MongoClient | null = null;
let db: Db | null = null;

async function connect(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);

  return db;
}

export default async function getCollection(
  collectionName: string
): Promise<Collection> {
  if (!db) {
    db = await connect();
  }
  return db.collection(collectionName);
}
