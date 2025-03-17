import { message } from 'antd';

interface RequestOptions extends RequestInit {
  data?: any;
  params?: Record<string, string>;
}

interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

// Mock 数据
const mockWorkflows = [
  {
    id: '1',
    name: '示例工作流',
    description: '这是一个示例工作流',
    tags: ['示例', '测试'],
    nodes: [
      {
        id: 'node-1',
        type: 'llm',
        position: { x: 100, y: 100 },
        data: {
          label: 'LLM节点',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
        },
      },
      {
        id: 'node-2',
        type: 'prompt',
        position: { x: 300, y: 100 },
        data: {
          label: '提示词节点',
          template: '这是一个示例提示词',
          variables: ['变量1', '变量2'],
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      },
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

// Mock 请求处理函数
async function mockRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', data, params } = options;

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // 移除 /api 前缀
    const apiUrl = url.replace('/api', '');

    // 处理不同的请求路径和方法
    if (apiUrl.startsWith('/workflows')) {
      const id = apiUrl.split('/').pop();
      
      switch (method) {
        case 'GET':
          if (id && id !== 'workflows') {
            const workflow = mockWorkflows.find((w) => w.id === id);
            if (workflow) {
              return workflow as T;
            }
            throw new Error('工作流不存在');
          }
          return mockWorkflows as T;

        case 'POST':
          const newWorkflow = {
            ...data,
            id: String(mockWorkflows.length + 1),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockWorkflows.push(newWorkflow);
          return newWorkflow as T;

        case 'PUT':
          if (!id) throw new Error('缺少工作流ID');
          const index = mockWorkflows.findIndex((w) => w.id === id);
          if (index === -1) throw new Error('工作流不存在');
          mockWorkflows[index] = {
            ...mockWorkflows[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return mockWorkflows[index] as T;

        case 'DELETE':
          if (!id) throw new Error('缺少工作流ID');
          const deleteIndex = mockWorkflows.findIndex((w) => w.id === id);
          if (deleteIndex === -1) throw new Error('工作流不存在');
          mockWorkflows.splice(deleteIndex, 1);
          return undefined as T;
      }
    }

    throw new Error('未知的请求路径');
  } catch (error) {
    message.error(error instanceof Error ? error.message : '请求失败');
    throw error;
  }
}

export const get = <T = any>(url: string, params?: Record<string, string>) =>
  mockRequest<T>(url, { method: 'GET', params });

export const post = <T = any>(url: string, data?: any) =>
  mockRequest<T>(url, { method: 'POST', data });

export const put = <T = any>(url: string, data?: any) =>
  mockRequest<T>(url, { method: 'PUT', data });

export const del = <T = any>(url: string) =>
  mockRequest<T>(url, { method: 'DELETE' });

export { mockRequest as request }; 