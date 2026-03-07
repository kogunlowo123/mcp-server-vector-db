import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VectorProvider, VectorRecord } from "../providers/types.js";

export function registerUpsertVectors(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "upsert_vectors",
    "Insert or update vectors in a collection with optional metadata",
    {
      collection: z.string().describe("Name of the vector collection"),
      vectors: z
        .array(
          z.object({
            id: z.string().describe("Unique identifier for the vector"),
            values: z.array(z.number()).describe("The embedding vector values"),
            metadata: z
              .record(z.unknown())
              .optional()
              .describe("Optional metadata key-value pairs"),
          })
        )
        .describe("Array of vectors to upsert"),
    },
    async ({ collection, vectors }) => {
      try {
        const provider = getProvider();
        const records: VectorRecord[] = vectors.map((v) => ({
          id: v.id,
          values: v.values,
          metadata: v.metadata,
        }));

        const result = await provider.upsert(collection, records);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  provider: provider.name,
                  collection,
                  upsertedCount: result.upsertedCount,
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
          content: [{ type: "text" as const, text: `Upsert error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
