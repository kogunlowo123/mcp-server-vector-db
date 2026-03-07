import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VectorProvider } from "../providers/types.js";

export function registerQueryVectors(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "query_vectors",
    "Query similar vectors from a collection using a vector or embedding",
    {
      collection: z.string().describe("Name of the vector collection"),
      vector: z.array(z.number()).describe("Query vector for similarity search"),
      topK: z
        .number()
        .int()
        .positive()
        .default(10)
        .describe("Number of results to return. Defaults to 10."),
      filter: z
        .record(z.unknown())
        .optional()
        .describe("Metadata filter for narrowing results"),
      includeMetadata: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include metadata in results. Defaults to true."),
    },
    async ({ collection, vector, topK, filter, includeMetadata }) => {
      try {
        const provider = getProvider();
        const results = await provider.query(
          collection,
          vector,
          topK,
          filter,
          includeMetadata
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  provider: provider.name,
                  collection,
                  resultCount: results.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Query error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
