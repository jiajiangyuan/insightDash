import { Node, Edge } from 'reactflow';
import { WorkflowNodeType } from './workflow';

// 验证错误类型
export interface ValidationError {
  type: 'connection' | 'configuration' | 'cycle' | 'parameter';
  nodeId?: string;
  edgeId?: string;
  message: string;
  details?: string;
}

// 节点连接规则
export interface ConnectionRule {
  sourceType: WorkflowNodeType;
  targetTypes: WorkflowNodeType[];
  maxConnections?: number;
  minConnections?: number;
}

// 节点参数验证规则
export interface ParameterValidationRule {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  enum?: string[];
  validate?: (value: any) => boolean;
  message?: string;
}

// 节点配置验证规则
export interface NodeValidationRule {
  type: WorkflowNodeType;
  requiredParams: string[];
  paramRules: Record<string, ParameterValidationRule>;
  connectionRules: ConnectionRule[];
} 