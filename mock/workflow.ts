import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

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

export default {
  // 获取工作流列表
  'GET /api/workflows': (req: Request, res: Response) => {
    res.json({
      code: 0,
      data: mockWorkflows,
      message: 'success',
    });
  },

  // 获取单个工作流
  'GET /api/workflows/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = mockWorkflows.find((w) => w.id === id);
    if (workflow) {
      res.json({
        code: 0,
        data: workflow,
        message: 'success',
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '工作流不存在',
      });
    }
  },

  // 创建工作流
  'POST /api/workflows': (req: Request, res: Response) => {
    const workflow = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWorkflows.push(workflow);
    res.json({
      code: 0,
      data: workflow,
      message: 'success',
    });
  },

  // 更新工作流
  'PUT /api/workflows/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = mockWorkflows.findIndex((w) => w.id === id);
    if (index !== -1) {
      mockWorkflows[index] = {
        ...mockWorkflows[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      res.json({
        code: 0,
        data: mockWorkflows[index],
        message: 'success',
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '工作流不存在',
      });
    }
  },

  // 删除工作流
  'DELETE /api/workflows/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = mockWorkflows.findIndex((w) => w.id === id);
    if (index !== -1) {
      mockWorkflows.splice(index, 1);
      res.json({
        code: 0,
        message: 'success',
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '工作流不存在',
      });
    }
  },
}; 