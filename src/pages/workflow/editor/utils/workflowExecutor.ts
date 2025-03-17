import { WorkflowNode, WorkflowEdge, NodeConfig, InputDataType } from '../types';
import { LLMService, LLMConfig } from '../services/llmService';

export interface ExecutionContext {
  variables: Record<string, any>;
  nodeOutputs: Record<string, any>;
}

export interface ExecutionStatus {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ExecutionResult {
  success: boolean;
  error?: string;
  outputs?: Record<string, any>;
  status: ExecutionStatus[];
}

export class WorkflowExecutor {
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private context: ExecutionContext;
  private status: Map<string, ExecutionStatus>;
  private onStatusChange?: (status: ExecutionStatus[]) => void;
  private llmService: LLMService;

  constructor(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    onStatusChange?: (status: ExecutionStatus[]) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = {
      variables: {},
      nodeOutputs: {},
    };
    this.status = new Map();
    this.onStatusChange = onStatusChange;
    this.llmService = new LLMService();
  }

  private updateStatus(nodeId: string, status: Partial<ExecutionStatus>) {
    const currentStatus = this.status.get(nodeId) || {
      nodeId,
      status: 'pending',
      progress: 0,
    };

    const newStatus = {
      ...currentStatus,
      ...status,
    };

    this.status.set(nodeId, newStatus);
    this.onStatusChange?.(Array.from(this.status.values()));
  }

  private async executeNode(node: WorkflowNode): Promise<any> {
    const { id, type, data } = node;

    try {
      this.updateStatus(id, {
        status: 'running',
        progress: 0,
        startTime: new Date(),
      });

      let result: any;

      switch (type) {
        case 'input':
          result = await this.executeInputNode(data);
          break;
        case 'llm':
          result = await this.executeLLMNode(data);
          break;
        case 'prompt':
          result = await this.executePromptNode(data);
          break;
        case 'condition':
          result = await this.executeConditionNode(data);
          break;
        case 'loop':
          result = await this.executeLoopNode(data);
          break;
        case 'function':
          result = await this.executeFunctionNode(data);
          break;
        case 'api':
          result = await this.executeAPINode(data);
          break;
        default:
          throw new Error(`不支持的节点类型: ${type}`);
      }

      this.updateStatus(id, {
        status: 'completed',
        progress: 100,
        endTime: new Date(),
      });

      return result;
    } catch (error) {
      this.updateStatus(id, {
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : '未知错误',
        endTime: new Date(),
      });
      throw error;
    }
  }

  private async executeInputNode(data: NodeConfig): Promise<any> {
    if (!data.dataType) {
      throw new Error('输入节点必须指定数据类型');
    }

    try {
      this.updateStatus(data.id, {
        message: `正在处理${data.dataType}类型数据`,
        progress: 50,
      });

      // 验证输入值
      if (data.value === undefined || data.value === null) {
        throw new Error('输入值不能为空');
      }

      // 根据数据类型处理输入
      switch (data.dataType) {
        case 'text':
          return {
            type: 'text',
            content: String(data.value),
          };

        case 'json':
          try {
            const parsedJson = typeof data.value === 'string' 
              ? JSON.parse(data.value)
              : data.value;
            return {
              type: 'json',
              content: parsedJson,
            };
          } catch (error) {
            throw new Error('无效的JSON格式');
          }

        case 'number':
          const num = Number(data.value);
          if (isNaN(num)) {
            throw new Error('无效的数字格式');
          }
          return {
            type: 'number',
            content: num,
          };

        case 'boolean':
          return {
            type: 'boolean',
            content: Boolean(data.value),
          };

        case 'array':
          if (!Array.isArray(data.value)) {
            try {
              const parsedArray = JSON.parse(data.value);
              if (!Array.isArray(parsedArray)) {
                throw new Error('输入必须是数组格式');
              }
              return {
                type: 'array',
                content: parsedArray,
              };
            } catch (error) {
              throw new Error('无效的数组格式');
            }
          }
          return {
            type: 'array',
            content: data.value,
          };

        case 'object':
          if (typeof data.value === 'string') {
            try {
              const parsedObject = JSON.parse(data.value);
              if (typeof parsedObject !== 'object' || parsedObject === null) {
                throw new Error('输入必须是对象格式');
              }
              return {
                type: 'object',
                content: parsedObject,
              };
            } catch (error) {
              throw new Error('无效的对象格式');
            }
          }
          if (typeof data.value !== 'object' || data.value === null) {
            throw new Error('输入必须是对象格式');
          }
          return {
            type: 'object',
            content: data.value,
          };

        default:
          throw new Error(`不支持的数据类型: ${data.dataType}`);
      }
    } catch (error) {
      this.updateStatus(data.id, {
        message: `输入节点执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        progress: 0,
      });
      throw error;
    }
  }

  private async executeLLMNode(data: NodeConfig): Promise<any> {
    if (!data.model) {
      throw new Error('LLM节点必须指定模型');
    }

    try {
      this.updateStatus(data.id, {
        message: `正在调用${data.model}模型`,
        progress: 30,
      });

      // 获取输入数据
      const inputEdges = this.edges.filter(edge => edge.target === data.id);
      if (inputEdges.length === 0) {
        throw new Error('LLM节点必须有输入连接');
      }

      // 获取输入文本
      const inputData = this.context.nodeOutputs[inputEdges[0].source];
      if (!inputData || !inputData.content) {
        throw new Error('无效的输入数据');
      }

      const prompt = String(inputData.content);

      // 准备LLM配置
      const llmConfig: LLMConfig = {
        model: data.model,
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens,
      };

      this.updateStatus(data.id, {
        message: '正在生成回复...',
        progress: 60,
      });

      // 调用LLM服务
      const response = await this.llmService.generateCompletion(prompt, llmConfig);

      this.updateStatus(data.id, {
        message: '生成完成',
        progress: 90,
      });

      // 返回结果
      return {
        type: 'text',
        content: response.content,
        metadata: {
          model: response.model,
          usage: response.usage,
        },
      };
    } catch (error) {
      this.updateStatus(data.id, {
        message: `LLM节点执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        progress: 0,
      });
      throw error;
    }
  }

  private async executePromptNode(data: NodeConfig): Promise<any> {
    // 实现提示词节点的执行逻辑
    return { result: 'Prompt result' };
  }

  private async executeConditionNode(data: NodeConfig): Promise<any> {
    // 实现条件节点的执行逻辑
    return { result: true };
  }

  private async executeLoopNode(data: NodeConfig): Promise<any> {
    // 实现循环节点的执行逻辑
    return { result: [] };
  }

  private async executeFunctionNode(data: NodeConfig): Promise<any> {
    // 实现函数节点的执行逻辑
    return { result: 'Function result' };
  }

  private async executeAPINode(data: NodeConfig): Promise<any> {
    // 实现API节点的执行逻辑
    return { result: 'API response' };
  }

  private async executeNodeWithDependencies(node: WorkflowNode): Promise<any> {
    // 获取节点的输入边
    const inputEdges = this.edges.filter(edge => edge.target === node.id);
    
    // 执行所有依赖节点
    const dependencies = await Promise.all(
      inputEdges.map(async edge => {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        if (!sourceNode) {
          throw new Error(`找不到源节点: ${edge.id}`);
        }
        return this.executeNodeWithDependencies(sourceNode);
      })
    );

    // 更新上下文
    inputEdges.forEach((edge, index) => {
      this.context.nodeOutputs[edge.source] = dependencies[index];
    });

    // 执行当前节点
    return this.executeNode(node);
  }

  public async execute(): Promise<ExecutionResult> {
    try {
      // 重置状态
      this.status.clear();
      this.context = {
        variables: {},
        nodeOutputs: {},
      };

      // 找到输入节点
      const inputNode = this.nodes.find(node => node.type === 'input');
      if (!inputNode) {
        throw new Error('工作流中没有找到输入节点');
      }

      // 执行工作流
      const result = await this.executeNodeWithDependencies(inputNode);

      return {
        success: true,
        outputs: this.context.nodeOutputs,
        status: Array.from(this.status.values()),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        status: Array.from(this.status.values()),
      };
    }
  }
} 