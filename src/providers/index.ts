export { VectorProvider, VectorRecord, QueryResult, CollectionInfo, CollectionStats } from "./types.js";
export { PineconeProvider } from "./pinecone.js";
export { WeaviateProvider } from "./weaviate.js";
export { QdrantProvider } from "./qdrant.js";
export { ChromaDBProvider } from "./chromadb.js";

import { VectorProvider } from "./types.js";
import { PineconeProvider } from "./pinecone.js";
import { WeaviateProvider } from "./weaviate.js";
import { QdrantProvider } from "./qdrant.js";
import { ChromaDBProvider } from "./chromadb.js";

export type ProviderName = "pinecone" | "weaviate" | "qdrant" | "chromadb";

export function createProvider(
  name: ProviderName,
  config: Record<string, string>
): VectorProvider {
  switch (name) {
    case "pinecone":
      if (!config.apiKey) throw new Error("Pinecone requires an apiKey");
      return new PineconeProvider(config.apiKey);
    case "weaviate":
      if (!config.host) throw new Error("Weaviate requires a host");
      return new WeaviateProvider(config.host, config.apiKey);
    case "qdrant":
      if (!config.url) throw new Error("Qdrant requires a url");
      return new QdrantProvider(config.url, config.apiKey);
    case "chromadb":
      return new ChromaDBProvider(config.host ?? "http://localhost:8000");
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
