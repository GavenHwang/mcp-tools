# MySQL MCP 服务器

MySQL 数据库 MCP 服务器，提供安全的数据库查询能力。

## 技术栈

- Node.js
- mysql2
- @modelcontextprotocol/sdk

## 功能特性

- **mysql_execute** - 执行 SQL 语句（SELECT/INSERT/UPDATE/DELETE）
- **db_schema** - 获取数据库表结构
- **create_user** - 创建用户（业务示例）

## 安全特性

- 表级权限控制
- 危险操作二次确认
- 禁止操作配置
- SQL 审计日志

## 安装

```bash
cd mysql-mcp-server
pnpm install
```

## 配置

创建 `.env` 文件并配置以下参数：

```env
# 数据库连接配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# 允许操作的表，逗号分隔，* 表示允许所有表
ALLOWED_TABLES=*

# 禁止的操作类型，逗号分隔，置空则不禁止任何操作
FORBIDDEN_OPS=drop,truncate

# 需二次确认的操作，逗号分隔，置空则跳过确认
DANGEROUS_OPS=delete,update

# 审计日志目录，置空则输出到控制台
AUDIT_LOG_DIR=./logs
```

## MCP 客户端配置

### 基础配置（使用 .env 文件）

```json
{
  "mcpServers": {
    "mysql-mcp-server": {
      "command": "node",
      "args": ["/Users/gavenhwang/Documents/Code/QoderProjects/mcp-tools/mysql-mcp-server/index.js"]
    }
  }
}
```

### 通过环境变量配置

如果不想使用 `.env` 文件，可以直接在 MCP 客户端配置中指定环境变量：

```json
{
  "mcpServers": {
    "mysql-mcp-server": {
      "command": "node",
      "args": ["/Users/gavenhwang/Documents/Code/QoderProjects/mcp-tools/mysql-mcp-server/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "ALLOWED_TABLES": "*",
        "FORBIDDEN_OPS": "drop,truncate",
        "DANGEROUS_OPS": "delete,update",
        "AUDIT_LOG_DIR": "/path/to/logs"
      }
    }
  }
}
```

## 使用示例

### 查询数据

```sql
SELECT * FROM users WHERE id = 1;
```

### 获取表结构

调用 `db_schema` 工具即可获取所有表的结构信息。

### 创建用户

调用 `create_user` 工具，传入 `name` 和 `email` 参数。

## 审计日志

如果配置了 `AUDIT_LOG_DIR`，所有 SQL 操作都会记录到日志文件中：

- `mutation-{date}.log` - 记录所有修改操作（INSERT/UPDATE/DELETE）
- `query-{date}.log` - 记录所有查询操作（SELECT）

日志按天分割，方便追溯和审计。

## 许可证

MIT
