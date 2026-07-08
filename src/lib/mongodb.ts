import { MongoClient, type Db } from "mongodb";

/**
 * Cached MongoDB connection — one client per serverless instance, reused
 * across invocations (the standard Vercel/Next.js pattern so Atlas doesn't
 * accumulate a new connection per request).
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
    }).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(process.env.MONGODB_DB ?? "realestate");
}

/** Collection name for property listings. */
export const PROPERTIES_COLLECTION = "properties";
