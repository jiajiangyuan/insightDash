import { Node, Edge } from 'reactflow';

// 节点类型
export type NodeType = 'input' | 'output' | 'llm' | 'prompt' | 'condition' | 'loop' | 'function' | 'api';

// 输入数据类型
export type InputDataType = 'text' | 'json' | 'number' | 'boolean' | 'array' | 'object';

// 节点配置接口
export interface NodeConfig {
  id: string;
  label: string;
  description?: string;
  
  // 输入节点配置
  dataType?: InputDataType;
  value?: any;
  
  // LLM节点配置
  model?: string;
  temperature?: number;
  maxTokens?: number;
  
  // 提示词节点配置
  template?: string;
  variables?: string[];
  
  // 条件节点配置
  condition?: string;
  trueBranch?: string;
  falseBranch?: string;
  
  // 循环节点配置
  maxIterations?: number;
  
  // 函数节点配置
  functionName?: string;
  parameters?: string;
  
  // API节点配置
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: string;
  body?: string;
}

// 工作流节点类型
export type WorkflowNode = Node<NodeConfig>;

// 工作流边类型
export type WorkflowEdge = Edge;

// 工作流模板类型
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
} 