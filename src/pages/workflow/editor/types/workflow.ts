import { Node, Edge } from 'reactflow';

// 工作流模板类型
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 工作流节点类型
export type WorkflowNodeType = 
  | 'input'
  | 'llm'
  | 'prompt'
  | 'data'
  | 'condition'
  | 'loop'
  | 'output';

// 工作流节点数据
export interface WorkflowNodeData {
  type: WorkflowNodeType;
  label: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
  result?: any;
}

// 工作流执行状态
export interface WorkflowExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  results: Record<string, any>;
  nodeStates: Record<string, {
    status: 'idle' | 'running' | 'success' | 'error';
    startTime?: Date;
    endTime?: Date;
    error?: string;
    result?: any;
  }>;
} 