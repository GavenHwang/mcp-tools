// 可通过 .env 配置，逗号分隔，默认 drop,truncate,alter
const forbiddenOps = (process.env.FORBIDDEN_OPS || "drop,truncate,alter").split(",").filter(Boolean);
const forbidden = forbiddenOps.length > 0 
  ? new RegExp(`\\b(${forbiddenOps.join("|")})\\b`, "i") 
  : null;

// 可通过 .env 配置，逗号分隔，默认 delete,update；设为空则跳过确认
const dangerousOps = (process.env.DANGEROUS_OPS ?? "delete,update").split(",").filter(Boolean);
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

