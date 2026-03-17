// @ts-nocheck
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VectorProvider } from "../providers/types.js";

export function registerCreateCollection(
  server: McpServer,
  getProvider: () => VectorProvider
): void {
  server.tool(
    "create_collection",
    "Create a new vector collection with specified dimensions and distance metric",
    {
      name: z.string().describe("Name of the collection to create"),
      dimension: z
        .number()
        .int()
        .positive()
        .describe("Vector dimension size (e.g. 1536 for OpenAI embeddings)"),
      metric: z
        .string()
        .optional()
        .default("cosine")
        .describe(
          "Distance metric: cosine, euclidean, or dotproduct. Defaults to cosine."
        ),
    },
    async ({ name, dimension, metric }) => {
      try {
        const provider = getProvider();
        const collection = await provider.createCollection(
          name,
          dimension,
          metric
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  provider: provider.name,
                  collection,
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
            { type: "text" as const, text: `Create error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
