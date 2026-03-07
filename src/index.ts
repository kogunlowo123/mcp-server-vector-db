import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createProvider, ProviderName, VectorProvider } from "./providers/index.js";
import { registerUpsertVectors } from "./tools/upsert_vectors.js";
import { registerQueryVectors } from "./tools/query_vectors.js";
import { registerDeleteVectors } from "./tools/delete_vectors.js";
import { registerListCollections } from "./tools/list_collections.js";
import { registerCreateCollection } from "./tools/create_collection.js";
import { registerGetCollectionStats } from "./tools/get_collection_stats.js";

const server = new McpServer({
  name: "mcp-server-vector-db",
  version: "1.0.0",
});

let provider: VectorProvider | null = null;

function getProvider(): VectorProvider {
  if (!provider) {
    const providerName = (process.env.VECTOR_PROVIDER ?? "chromadb") as ProviderName;
    const config: Record<string, string> = {};

    if (process.env.VECTOR_API_KEY) config.apiKey = process.env.VECTOR_API_KEY;
    if (process.env.VECTOR_HOST) config.host = process.env.VECTOR_HOST;
    if (process.env.VECTOR_URL) config.url = process.env.VECTOR_URL;

    provider = createProvider(providerName, config);
    console.error(`Initialized ${providerName} provider`);
  }
  return provider;
}

registerUpsertVectors(server, getProvider);
registerQueryVectors(server, getProvider);
registerDeleteVectors(server, getProvider);
registerListCollections(server, getProvider);
registerCreateCollection(server, getProvider);
registerGetCollectionStats(server, getProvider);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Vector DB Server running on stdio");
}

main().catch((error: Error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
