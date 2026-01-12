# MCP Tools

个人开发的 MCP (Model Context Protocol) 工具集合。

## 工具列表

### mysql-mcp-server

MySQL 数据库 MCP 服务器，提供数据库查询能力。

**技术栈**: Node.js, mysql2, @modelcontextprotocol/sdk

**功能**:
- `mysql_execute` - SQL 执行（危险操作需确认）
- `db_schema` - 获取库表结构
- `create_user` - 创建用户（业务示例）

**安装**:
```bash
cd mysql-mcp-server
pnpm install
```

**配置 .env**:
```env
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

**MCP 客户端配置**:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/path/to/mysql-mcp-server/index.js"],
      "cwd": "/path/to/mysql-mcp-server"
    }
  }
}
```

## 许可证

MIT
