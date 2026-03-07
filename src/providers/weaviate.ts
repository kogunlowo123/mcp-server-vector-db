import weaviate, { WeaviateClient } from "weaviate-ts-client";
import {
  VectorProvider,
  VectorRecord,
  QueryResult,
  CollectionInfo,
  CollectionStats,
} from "./types.js";

export class WeaviateProvider implements VectorProvider {
  name = "weaviate";
  private client: WeaviateClient;

  constructor(host: string, apiKey?: string) {
    const config: { scheme: string; host: string; apiKey?: { apiKey: string } } = {
      scheme: "https",
      host,
    };
    if (apiKey) {
      config.apiKey = { apiKey };
    }
    this.client = weaviate.client(config);
  }

  async upsert(
    collection: string,
    vectors: VectorRecord[]
  ): Promise<{ upsertedCount: number }> {
    let batcher = this.client.batch.objectsBatcher();
    for (const v of vectors) {
      batcher = batcher.withObject({
        class: collection,
        id: v.id,
        vector: v.values,
        properties: v.metadata ?? {},
      });
    }
    await batcher.do();
    return { upsertedCount: vectors.length };
  }

  async query(
    collection: string,
    vector: number[],
    topK: number,
    _filter?: Record<string, unknown>,
    _includeMetadata = true
  ): Promise<QueryResult[]> {
    const result = await this.client.graphql
      .get()
      .withClassName(collection)
      .withNearVector({ vector })
      .withLimit(topK)
      .withFields("_additional { id distance }")
      .do();

    const objects = result?.data?.Get?.[collection] || [];
    return objects.map((obj: Record<string, unknown>) => {
      const additional = obj._additional as { id: string; distance: number };
      return {
        id: additional.id,
        score: 1 - additional.distance,
        metadata: obj,
      };
    });
  }

  async deleteVectors(
    collection: string,
    ids: string[]
  ): Promise<{ deletedCount: number }> {
    for (const id of ids) {
      await this.client.data.deleter().withClassName(collection).withId(id).do();
    }
    return { deletedCount: ids.length };
  }

  async listCollections(): Promise<CollectionInfo[]> {
    const schema = await this.client.schema.getter().do();
    return (schema.classes || []).map((cls) => ({
      name: cls.class ?? "unknown",
      dimension: 0,
      count: 0,
    }));
  }

  async createCollection(
    name: string,
    dimension: number,
    metric = "cosine"
  ): Promise<CollectionInfo> {
    await this.client.schema
      .classCreator()
      .withClass({
        class: name,
        vectorIndexConfig: {
          distance: metric,
        },
      })
      .do();
    return { name, dimension, count: 0, metric };
  }

  async getCollectionStats(collection: string): Promise<CollectionStats> {
    const result = await this.client.graphql
      .aggregate()
      .withClassName(collection)
      .withFields("meta { count }")
      .do();

    const agg = result?.data?.Aggregate?.[collection]?.[0];
    const count = agg?.meta?.count ?? 0;

    return {
      name: collection,
      vectorCount: count,
      dimension: 0,
      status: "ready",
    };
  }
}
