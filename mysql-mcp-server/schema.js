import { pool } from "./db.js";

export async function loadSchema() {
  const [tables] = await pool.query("SHOW TABLES");
  const schema = {};

  for (const row of tables) {
    const table = Object.values(row)[0];
    const [cols] = await pool.query(`DESCRIBE \`${table}\``);
    schema[table] = cols.map(c => ({
      name: c.Field,
      type: c.Type
    }));
  }

  return schema;
}

