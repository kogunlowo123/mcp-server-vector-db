import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VectorProvider } from "../providers/types.js";

export function registerGetCollectionStats(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "get_collection_stats",
    "Get statistics and information about a specific vector collection",
    {
      collection: z.string().describe("Name of the vector collection"),
    },
    async ({ collection }) => {
      try {
        const provider = getProvider();
        const stats = await provider.getCollectionStats(collection);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  provider: provider.name,
                  stats,
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
          content: [
            { type: "text" as const, text: `Stats error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
