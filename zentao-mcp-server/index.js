#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '.env') });

const ZENTAO_BASE_URL = process.env.ZENTAO_BASE_URL;
const ZENTAO_USERNAME = process.env.ZENTAO_USERNAME;
const ZENTAO_PASSWORD = process.env.ZENTAO_PASSWORD;

// 验证配置
if (!ZENTAO_BASE_URL || !ZENTAO_USERNAME || !ZENTAO_PASSWORD) {
  console.error('错误：缺少必要的环境变量配置。请检查 .env 文件。');
  process.exit(1);
}

/**
 * 禅道API客户端
 */
class ZentaoClient {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.sessionName = 'zentaosid';
    this.sessionId = null;
  }

  /**
   * 登录获取会话
   */
  async login() {
    try {
      // 禅道登录API
      const loginUrl = `${this.baseUrl}/user-login.json`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `account=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`,
      });

      if (!response.ok) {
        throw new Error(`登录失败: HTTP ${response.status}`);
      }

      // 从响应头中获取会话ID
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/zentaosid=([^;]+)/);
        if (match) {
          this.sessionId = match[1];
        }
      }

      const data = await response.json();
      if (data.status === 'success') {
        console.error('禅道登录成功');
      } else {
        throw new Error('登录失败: ' + (data.message || '未知错误'));
      }
    } catch (error) {
      throw new Error(`登录异常: ${error.message}`);
    }
  }

  /**
   * 确保已登录
   */
  async ensureLoggedIn() {
    if (!this.sessionId) {
      await this.login();
    }
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.sessionId) {
      headers['Cookie'] = `${this.sessionName}=${this.sessionId}`;
    }
    return headers;
  }

  /**
   * 发送GET请求
   */
  async get(url) {
    await this.ensureLoggedIn();
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`请求失败: ${error.message}`);
    }
  }

  /**
   * 查询需求(Story)详情
   */
  async getStory(storyId) {
    const url = `${this.baseUrl}/story-view-${storyId}.json`;
    return await this.get(url);
  }

  /**
   * 查询Bug详情
   */
  async getBug(bugId) {
    const url = `${this.baseUrl}/bug-view-${bugId}.json`;
    return await this.get(url);
  }

  /**
   * 查询测试用例详情
   */
  async getTestCase(caseId) {
    const url = `${this.baseUrl}/testcase-view-${caseId}.json`;
    return await this.get(url);
  }
}

// 创建禅道客户端实例
const zentaoClient = new ZentaoClient(ZENTAO_BASE_URL, ZENTAO_USERNAME, ZENTAO_PASSWORD);

// 创建MCP服务器
const server = new Server(
  {
    name: 'zentao-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 注册工具列表
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_zentao_story',
        description: '根据需求ID查询禅道需求详情',
        inputSchema: {
          type: 'object',
          properties: {
            story_id: {
              type: 'string',
              description: '需求ID',
            },
          },
          required: ['story_id'],
        },
      },
      {
        name: 'get_zentao_bug',
        description: '根据Bug ID查询禅道Bug详情',
        inputSchema: {
          type: 'object',
          properties: {
            bug_id: {
              type: 'string',
              description: 'Bug ID',
            },
          },
          required: ['bug_id'],
        },
      },
      {
        name: 'get_zentao_testcase',
        description: '根据用例ID查询禅道测试用例详情',
        inputSchema: {
          type: 'object',
          properties: {
            case_id: {
              type: 'string',
              description: '测试用例ID',
            },
          },
          required: ['case_id'],
        },
      },
    ],
  };
});

/**
 * 处理工具调用
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_zentao_story': {
        const { story_id } = args;
        const data = await zentaoClient.getStory(story_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_zentao_bug': {
        const { bug_id } = args;
        const data = await zentaoClient.getBug(bug_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_zentao_testcase': {
        const { case_id } = args;
        const data = await zentaoClient.getTestCase(case_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * 启动服务器
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('禅道MCP服务器已启动');
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
