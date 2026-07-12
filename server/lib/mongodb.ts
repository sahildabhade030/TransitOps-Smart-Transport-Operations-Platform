import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DB ?? "transitops";

let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient() {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  return client.db(databaseName);
}
