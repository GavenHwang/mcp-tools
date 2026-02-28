# 禅道 MCP 服务器

这是一个用于与禅道系统集成的 MCP (Model Context Protocol) 服务器。

## 功能特性

- 查询需求(Story)详情
- 查询Bug详情
- 查询测试用例详情

## 配置说明

1. 在当前目录下新建 `.env` 文件并配置你的禅道信息：

```bash
ZENTAO_BASE_URL=http://hpczentao.sugon.com
ZENTAO_USERNAME=你的用户名
ZENTAO_PASSWORD=你的密码
```

2. 安装依赖：

```bash
pnpm install
```

## 使用方法

### 在 MCP 客户端中配置

在你的 MCP 客户端配置文件中添加：

```json
{
  "mcpServers": {
    "zentao-mcp-server": {
      "command": "node",
      "args": ["/Users/gavenhwang/Documents/Code/QoderProjects/mcp-tools/zentao-mcp-server/index.js"]
    }
  }
}
```

### 可用工具

1. **get_zentao_story** - 查询需求详情
   - 参数：`story_id` (需求ID)
   - 示例：查询需求ID为11720的详情

2. **get_zentao_bug** - 查询Bug详情
   - 参数：`bug_id` (Bug ID)
   - 示例：查询Bug ID为117762的详情

3. **get_zentao_testcase** - 查询测试用例详情
   - 参数：`case_id` (用例ID)
   - 示例：查询用例ID为59785的详情

## API 示例

禅道的API访问格式：
- 需求：`http://hpczentao.sugon.com/story-view-{id}.json`
- Bug：`http://hpczentao.sugon.com/bug-view-{id}.json`
- 用例：`http://hpczentao.sugon.com/testcase-view-{id}.json`

## 开发说明

本服务器使用 Basic Auth 方式进行身份认证，请确保配置正确的用户名和密码。
