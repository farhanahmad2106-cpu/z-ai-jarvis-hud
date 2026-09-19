import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.DATABASE_URL || "";
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function addMemory(content: string, userId?: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("No OPENAI_API_KEY. Skipping memory generation.");
    return;
  }
  
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: content,
    });
    
    const mongoClient = await getClient();
    const db = mongoClient.db(); 
    const collection = db.collection('Memory');
    
    await collection.insertOne({
      content,
      embedding,
      userId: userId ? new ObjectId(userId) : null,
      createdAt: new Date()
    });
    
    console.log("[MemoryService] Successfully stored new memory.");
  } catch (error) {
    console.error("[MemoryService] Failed to add memory:", error);
  }
}

export async function queryMemories(query: string, userId?: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });
    
    const mongoClient = await getClient();
    const db = mongoClient.db();
    const collection = db.collection('Memory');
    
    const pipeline: any[] = [
      {
        "$vectorSearch": {
          "index": "vector_index", // Requires an Atlas Vector Search index named 'vector_index' on the 'embedding' field
          "path": "embedding",
          "queryVector": embedding,
          "numCandidates": 50,
          "limit": 3
        }
      }
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    return results.map(r => r.content);
  } catch (error) {
    console.error("[MemoryService] Failed to query memories:", error);
    return [];
  }
}
