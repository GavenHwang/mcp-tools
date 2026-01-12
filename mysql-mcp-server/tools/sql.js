import { z } from "zod";
import { pool } from "../db.js";
import { checkSQL, isDangerous } from "../security.js";
import { audit } from "../audit.js";

export const sqlTool = {
  name: "mysql_execute",
  description: "Execute MySQL SQL statements (SELECT/INSERT/UPDATE/DELETE)",
  inputSchema: {
    type: "object",
    properties: {
      sql: { type: "string" },
      params: { type: "array" },
      confirm: { type: "boolean" }
    },
    required: ["sql"]
  }
};

export async function handleSQL({ sql, params = [], confirm }) {
  checkSQL(sql);

  if (isDangerous(sql) && !confirm) {
    return {
      content: [{
        type: "text",
        text: "⚠️ Dangerous SQL detected. Re-run with confirm=true"
      }]
    };
  }

  audit(sql, params);

  const [rows] = await pool.execute(sql, params);

  return {
    content: [{
      type: "text",
      text: JSON.stringify(rows, null, 2)
    }]
  };
}

