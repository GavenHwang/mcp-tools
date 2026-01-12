import { withTransaction } from "../db.js";

export const businessTools = [
  {
    name: "create_user",
    description: "Create a new user",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" }
      },
      required: ["name", "email"]
    }
  }
];

export async function handleBusiness(name, args) {
  if (name === "create_user") {
    return withTransaction(async (conn) => {
      await conn.execute(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [args.name, args.email]
      );
      return {
        content: [{
          type: "text",
          text: "✅ User created"
        }]
      };
    });
  }

  throw new Error("Unknown business tool");
}

