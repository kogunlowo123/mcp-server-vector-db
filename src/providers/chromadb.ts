import { ChromaClient } from "chromadb";
import {
  VectorProvider,
  VectorRecord,
  QueryResult,
  CollectionInfo,
  CollectionStats,
} from "./types.js";

export class ChromaDBProvider implements VectorProvider {
  name = "chromadb";
  private client: ChromaClient;

  constructor(host = "http://localhost:8000") {
    this.client = new ChromaClient({ path: host });
  }

  async upsert(
    collection: string,
    vectors: VectorRecord[]
  ): Promise<{ upsertedCount: number }> {
    const col = await this.client.getCollection({ name: collection });
    await col.upsert({
      ids: vectors.map((v) => v.id),
      embeddings: vectors.map((v) => v.values),
      metadatas: vectors.map(
        (v) => (v.metadata as Record<string, string | number | boolean>) ?? {}
      ),
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
    const col = await this.client.getCollection({ name: collection });
    const results = await col.query({
      queryEmbeddings: [vector],
      nResults: topK,
      where: filter as Record<string, string | number | boolean>,
      include: includeMetadata ? ["metadatas", "distances"] : ["distances"],
    });

    const ids = results.ids?.[0] || [];
    const distances = results.distances?.[0] || [];
    const metadatas = results.metadatas?.[0] || [];

    return ids.map((id, i) => ({
      id,
      score: 1 - (distances[i] ?? 0),
      metadata: includeMetadata
        ? (metadatas[i] as Record<string, unknown>) ?? undefined
        : undefined,
    }));
  }

  async deleteVectors(
    collection: string,
    ids: string[]
  ): Promise<{ deletedCount: number }> {
    const col = await this.client.getCollection({ name: collection });
    await col.delete({ ids });
    return { deletedCount: ids.length };
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const collections = await this.client.listCollections();
    return collections.map((c) => ({
      name: c.name,
      dimension: 0,
      count: 0,
    }));
  }

  async createCollection(
    name: string,
    dimension: number,
    metric = "cosine"
  ): Promise<CollectionInfo> {
    await this.client.createCollection({
      name,
      metadata: { "hnsw:space": metric },
    });
    return { name, dimension, count: 0, metric };
  }

  async getCollectionStats(collection: string): Promise<CollectionStats> {
    const col = await this.client.getCollection({ name: collection });
    const count = await col.count();
    return {
      name: collection,
      vectorCount: count,
      dimension: 0,
      status: "ready",
    };
  }
}
