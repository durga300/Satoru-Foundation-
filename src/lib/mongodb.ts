import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient;
let db: Db;

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_DB_NAME || 'blog-platform';

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (client && db) {
    return { db, client };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('Connected to MongoDB successfully');
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    const { db: database } = await connectToDatabase();
    return database;
  }
  return db;
}

export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const database = await getDatabase();
  return database.collection<T>(collectionName);
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
  }
}

// Types for our blog data
export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  tags: string[];
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BlogImage {
  _id?: string;
  post_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  position: number;
  created_at: Date;
}