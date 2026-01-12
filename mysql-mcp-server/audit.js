import fs from "fs";
import path from "path";

const logDir = process.env.AUDIT_LOG_DIR || "";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getLogFile(sql) {
  const isQuery = /^\s*select\b/i.test(sql);
  const date = new Date().toISOString().slice(0, 10);
  return isQuery ? `query-${date}.log` : `mutation-${date}.log`;
}

export function audit(sql, params) {
  const line = `[${new Date().toISOString()}] SQL=${sql} PARAMS=${JSON.stringify(params)}\n`;
  
  if (logDir) {
    ensureDir(logDir);
    const logFile = path.join(logDir, getLogFile(sql));
    fs.appendFileSync(logFile, line);
  } else {
    console.error(line);
  }
}

