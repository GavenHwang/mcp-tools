import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { sqlTool, handleSQL } from "./tools/sql.js";
import { businessTools, handleBusiness } from "./tools/business.js";
import { loadSchema } from "./schema.js";

const server = new Server(
  { name: "mysql-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const schema = await loadSchema();

/* tools/list */
server.setRequestHandler(
  z.object({ method: z.literal("tools/list") }),
  async () => ({
    tools: [
      sqlTool,
      ...businessTools,
      {
        name: "db_schema",
        description: "Get database schema",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  })
);

/* tools/call */
server.setRequestHandler(
  z.object({
    method: z.literal("tools/call"),
    params: z.object({
      name: z.string(),
      arguments: z.any()
    })
  }),
  async ({ params }) => {
    try {
      if (params.name === "mysql_execute") {
        return handleSQL(params.arguments);
      }

      if (params.name === "db_schema") {
        return {
          content: [{
            type: "text",
            text: JSON.stringify(schema, null, 2)
          }]
        };
      }

      return handleBusiness(params.name, params.arguments);
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true
      };
    }
  }
);

await server.connect(new StdioServerTransport());
console.error("✅ Production MySQL MCP Server running");

