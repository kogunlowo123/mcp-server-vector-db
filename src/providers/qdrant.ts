import { QdrantClient } from "@qdrant/js-client-rest";
import {
  VectorProvider,
  VectorRecord,
  QueryResult,
  CollectionInfo,
  CollectionStats,
} from "./types.js";

export class QdrantProvider implements VectorProvider {
  name = "qdrant";
  private client: QdrantClient;

  constructor(url: string, apiKey?: string) {
    this.client = new QdrantClient({ url, apiKey });
  }

  async upsert(
    collection: string,
    vectors: VectorRecord[]
  ): Promise<{ upsertedCount: number }> {
    await this.client.upsert(collection, {
      wait: true,
      points: vectors.map((v) => ({
        id: v.id,
        vector: v.values,
        payload: v.metadata ?? {},
      })),
    });
    return { upsertedCount: vectors.length };
  }

  async query(
    collection: string,
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>,
    includeMetadata = true
  ): Promise<QueryResult[]> {
    const results = await this.client.search(collection, {
      vector,
      limit: topK,
      filter: filter as never,
      with_payload: includeMetadata,
    });

    return results.map((r) => ({
      id: String(r.id),
      score: r.score,
      metadata: r.payload as Record<string, unknown> | undefined,
    }));
  }

  async deleteVectors(
    collection: string,
    ids: string[]
  ): Promise<{ deletedCount: number }> {
    await this.client.delete(collection, {
      wait: true,
      points: ids,
    });
    return { deletedCount: ids.length };
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const response = await this.client.getCollections();
    return response.collections.map((c) => ({
      name: c.name,
      dimension: 0,
      count: 0,
    }));
  }

  async createCollection(
    name: string,
    dimension: number,
    metric = "Cosine"
  ): Promise<CollectionInfo> {
    await this.client.createCollection(name, {
      vectors: {
        size: dimension,
        distance: metric as "Cosine" | "Euclid" | "Dot",
      },
    });
    return { name, dimension, count: 0, metric };
  }

  async getCollectionStats(collection: string): Promise<CollectionStats> {
    const info = await this.client.getCollection(collection);
    return {
      name: collection,
      vectorCount: info.points_count ?? 0,
      dimension:
        typeof info.config.params.vectors === "object" &&
        "size" in info.config.params.vectors
          ? (info.config.params.vectors.size as number)
          : 0,
      status: String(info.status),
    };
  }
}
