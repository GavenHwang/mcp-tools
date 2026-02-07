// 可通过 .env 配置，逗号分隔，默认 drop,truncate,alter
const forbiddenOpsEnv = process.env.FORBIDDEN_OPS;
const forbiddenOps = (forbiddenOpsEnv === undefined ? "drop,truncate,alter" : forbiddenOpsEnv).split(",").filter(Boolean);
console.error("[DEBUG] FORBIDDEN_OPS env:", forbiddenOpsEnv, "→ parsed:", forbiddenOps);
const forbidden = forbiddenOps.length > 0 
  ? new RegExp(`\\b(${forbiddenOps.join("|")})\\b`, "i") 
  : null;

// 可通过 .env 配置，逗号分隔，默认 delete,update；设为空则跳过确认
const dangerousOpsEnv = process.env.DANGEROUS_OPS;
const dangerousOps = (dangerousOpsEnv === undefined ? "delete,update" : dangerousOpsEnv).split(",").filter(Boolean);
console.error("[DEBUG] DANGEROUS_OPS env:", dangerousOpsEnv, "→ parsed:", dangerousOps);
const dangerous = dangerousOps.length > 0 
  ? new RegExp(`\\b(${dangerousOps.join("|")})\\b`, "i") 
  : null;

const allowedTables = (process.env.ALLOWED_TABLES || "").split(",").filter(Boolean);

export function checkSQL(sql) {
  if (forbidden && forbidden.test(sql)) {
    throw new Error("Forbidden SQL operation");
  }

  if (allowedTables.length > 0 && allowedTables[0] !== "*" && !allowedTables.some(t => new RegExp(`\\b${t}\\b`, 'i').test(sql))) {
    throw new Error("Table not allowed");
  }
}

export function isDangerous(sql) {
  return dangerous ? dangerous.test(sql) : false;
}

