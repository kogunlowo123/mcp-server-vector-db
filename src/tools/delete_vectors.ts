import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VectorProvider } from "../providers/types.js";

export function registerDeleteVectors(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "delete_vectors",
    "Delete vectors from a collection by their IDs",
    {
      collection: z.string().describe("Name of the vector collection"),
      ids: z
        .array(z.string())
        .min(1)
        .describe("Array of vector IDs to delete"),
    },
    async ({ collection, ids }) => {
      try {
        const provider = getProvider();
        const result = await provider.deleteVectors(collection, ids);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  provider: provider.name,
                  collection,
                  deletedCount: result.deletedCount,
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
          content: [{ type: "text" as const, text: `Delete error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
