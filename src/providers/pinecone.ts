import { Pinecone } from "@pinecone-database/pinecone";
import {
  VectorProvider,
  VectorRecord,
  QueryResult,
  CollectionInfo,
  CollectionStats,
} from "./types.js";

export class PineconeProvider implements VectorProvider {
  name = "pinecone";
  private client: Pinecone;

  constructor(apiKey: string) {
    this.client = new Pinecone({ apiKey });
  }

  async upsert(
    collection: string,
    vectors: VectorRecord[]
  ): Promise<{ upsertedCount: number }> {
    const index = this.client.Index(collection);
    const records = vectors.map((v) => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata as Record<string, string | number | boolean | string[]>,
    }));

    await index.upsert(records);
    return { upsertedCount: vectors.length };
  }

  async query(
    collection: string,
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>,
    includeMetadata = true
  ): Promise<QueryResult[]> {
    const index = this.client.Index(collection);
    const response = await index.query({
      vector,
      topK,
      filter: filter as Record<string, string | number | boolean | string[]>,
      includeMetadata,
    });

    return (response.matches || []).map((m) => ({
      id: m.id,
      score: m.score ?? 0,
      metadata: m.metadata as Record<string, unknown> | undefined,
    }));
  }

  async deleteVectors(
    collection: string,
    ids: string[]
  ): Promise<{ deletedCount: number }> {
    const index = this.client.Index(collection);
    await index.deleteMany(ids);
    return { deletedCount: ids.length };
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const collections = await this.client.listIndexes();
    return (collections.indexes || []).map((idx) => ({
      name: idx.name,
      dimension: idx.dimension,
      count: 0,
      metric: idx.metric,
    }));
  }

  async createCollection(
    name: string,
    dimension: number,
    metric = "cosine"
  ): Promise<CollectionInfo> {
    await this.client.createIndex({
      name,
      dimension,
      metric: metric as "cosine" | "euclidean" | "dotproduct",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    return { name, dimension, count: 0, metric };
  }

  async getCollectionStats(collection: string): Promise<CollectionStats> {
    const index = this.client.Index(collection);
    const stats = await index.describeIndexStats();
    return {
      name: collection,
      vectorCount: stats.totalRecordCount ?? 0,
      dimension: stats.dimension ?? 0,
      status: "ready",
    };
  }
}
