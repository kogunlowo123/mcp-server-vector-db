import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VectorProvider } from "../providers/types.js";

export function registerListCollections(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "list_collections",
    "List all vector collections available in the configured provider",
    {},
    async () => {
      try {
        const provider = getProvider();
        const collections = await provider.listCollections();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  provider: provider.name,
                  count: collections.length,
                  collections,
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
            { type: "text" as const, text: `List error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
