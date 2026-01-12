import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawLogDir = process.env.AUDIT_LOG_DIR || "";
// 相对路径基于代码目录解析
const logDir = rawLogDir && !path.isAbsolute(rawLogDir) 
  ? path.resolve(__dirname, rawLogDir) 
  : rawLogDir;

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

