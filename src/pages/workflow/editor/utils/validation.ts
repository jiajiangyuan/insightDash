import { Node, Edge } from 'reactflow';
import { WorkflowNode, WorkflowEdge, NodeConfig } from '../types';
import { ValidationError, ParameterValidationRule } from '../types/validation';
import { nodeValidationRules } from '../config/validationRules';
import { WorkflowNodeType } from '../types/workflow';

export interface ValidationError {
  message: string;
  nodeId?: string;
  edgeId?: string;
}

// 检查节点类型是否允许作为源节点
const isValidSourceNode = (node: WorkflowNode): boolean => {
  return ['input', 'llm', 'prompt', 'data', 'condition', 'loop', 'function', 'api'].includes(node.type);
};

// 检查节点类型是否允许作为目标节点
const isValidTargetNode = (node: WorkflowNode): boolean => {
  return ['output', 'llm', 'prompt', 'data', 'condition', 'loop', 'function', 'api'].includes(node.type);
};

// 检查节点类型是否匹配
const isCompatibleConnection = (sourceNode: WorkflowNode, targetNode: WorkflowNode): boolean => {
  // 输入节点只能连接到处理节点
  if (sourceNode.type === 'input') {
    return ['llm', 'prompt', 'data', 'condition', 'loop', 'function', 'api'].includes(targetNode.type);
  }
  
  // 处理节点可以连接到其他处理节点或输出节点
  if (['llm', 'prompt', 'data', 'condition', 'loop', 'function', 'api'].includes(sourceNode.type)) {
    return ['llm', 'prompt', 'data', 'condition', 'loop', 'function', 'api', 'output'].includes(targetNode.type);
  }
  
  return false;
};

// 检查是否存在循环连接
const hasCycle = (nodes: Node[], edges: Edge[]): boolean => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      const targetId = edge.target;
      if (!visited.has(targetId)) {
        if (dfs(targetId)) return true;
      } else if (recursionStack.has(targetId)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
};

// 检查是否存在孤立节点
const hasIsolatedNodes = (nodes: Node[], edges: Edge[]): boolean => {
  const connectedNodes = new Set<string>();
  
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  return nodes.some(node => !connectedNodes.has(node.id));
};

// 验证节点连接
export const validateConnections = (nodes: Node[], edges: Edge[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 检查每个节点的连接
  nodes.forEach((node) => {
    const nodeType = node.type as WorkflowNodeType;
    const rules = nodeValidationRules[nodeType]?.connectionRules || [];

    // 获取节点的所有连接
    const nodeEdges = edges.filter(
      (edge) => edge.source === node.id || edge.target === node.id
    );

    // 检查每个连接规则
    rules.forEach((rule) => {
      // 检查目标节点类型
      const invalidTargets = nodeEdges.filter(
        (edge) =>
          edge.source === node.id &&
          !rule.targetTypes.includes(edge.target?.split('-')[0] as WorkflowNodeType)
      );

      if (invalidTargets.length > 0) {
        errors.push({
          type: 'connection',
          nodeId: node.id,
          edgeId: invalidTargets[0].id,
          message: `节点 ${node.data.label} 不能连接到 ${invalidTargets[0].target?.split('-')[0]} 类型的节点`,
          details: `允许连接的目标类型: ${rule.targetTypes.join(', ')}`,
        });
      }

      // 检查最大连接数
      if (rule.maxConnections !== undefined && nodeEdges.length > rule.maxConnections) {
        errors.push({
          type: 'connection',
          nodeId: node.id,
          message: `节点 ${node.data.label} 的连接数超过最大限制`,
          details: `最大连接数: ${rule.maxConnections}, 当前连接数: ${nodeEdges.length}`,
        });
      }

      // 检查最小连接数
      if (rule.minConnections !== undefined && nodeEdges.length < rule.minConnections) {
        errors.push({
          type: 'connection',
          nodeId: node.id,
          message: `节点 ${node.data.label} 的连接数少于最小限制`,
          details: `最小连接数: ${rule.minConnections}, 当前连接数: ${nodeEdges.length}`,
        });
      }
    });
  });

  return errors;
};

// 验证节点参数
export const validateNodeParameters = (node: Node): ValidationError[] => {
  const errors: ValidationError[] = [];
  const nodeType = node.type as WorkflowNodeType;
  const rules = nodeValidationRules[nodeType];

  if (!rules) return errors;

  // 检查必需参数
  rules.requiredParams.forEach((param) => {
    if (!node.data[param]) {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `节点 ${node.data.label} 缺少必需参数: ${param}`,
      });
    }
  });

  // 检查参数规则
  Object.entries(rules.paramRules).forEach(([param, rule]) => {
    const value = node.data[param];
    if (value === undefined) return;

    // 类型检查
    if (rule.type === 'number' && typeof value !== 'number') {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `参数 ${param} 必须是数字类型`,
        details: `当前值: ${value}`,
      });
    }

    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `参数 ${param} 必须是字符串类型`,
        details: `当前值: ${value}`,
      });
    }

    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `参数 ${param} 必须是布尔类型`,
        details: `当前值: ${value}`,
      });
    }

    // 模式匹配
    if (rule.pattern && typeof value === 'string') {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        errors.push({
          type: 'parameter',
          nodeId: node.id,
          message: `参数 ${param} 格式不正确`,
          details: rule.message || `必须匹配模式: ${rule.pattern}`,
        });
      }
    }

    // 数值范围
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          type: 'parameter',
          nodeId: node.id,
          message: `参数 ${param} 小于最小值`,
          details: `最小值: ${rule.min}, 当前值: ${value}`,
        });
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          type: 'parameter',
          nodeId: node.id,
          message: `参数 ${param} 大于最大值`,
          details: `最大值: ${rule.max}, 当前值: ${value}`,
        });
      }
    }

    // 枚举值
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `参数 ${param} 的值无效`,
        details: `有效值: ${rule.enum.join(', ')}, 当前值: ${value}`,
      });
    }

    // 自定义验证
    if (rule.validate && !rule.validate(value)) {
      errors.push({
        type: 'parameter',
        nodeId: node.id,
        message: `参数 ${param} 验证失败`,
        details: rule.message || '自定义验证失败',
      });
    }
  });

  return errors;
};

// 检测工作流循环
export const detectCycles = (nodes: Node[], edges: Edge[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (nodeId: string) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const nodeEdges = edges.filter((edge) => edge.source === nodeId);
    for (const edge of nodeEdges) {
      const targetId = edge.target;
      if (!targetId) continue;

      if (!visited.has(targetId)) {
        if (dfs(targetId)) {
          return true;
        }
      } else if (recursionStack.has(targetId)) {
        const sourceNode = nodes.find((n) => n.id === nodeId);
        const targetNode = nodes.find((n) => n.id === targetId);
        errors.push({
          type: 'cycle',
          nodeId,
          edgeId: edge.id,
          message: '检测到工作流循环',
          details: `循环路径: ${sourceNode?.data.label} -> ${targetNode?.data.label}`,
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });

  return errors;
};

// 验证整个工作流
export const validateWorkflow = (nodes: Node[], edges: Edge[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 验证节点连接
  errors.push(...validateConnections(nodes, edges));

  // 验证节点参数
  nodes.forEach((node) => {
    errors.push(...validateNodeParameters(node));
  });

  // 检测循环
  errors.push(...detectCycles(nodes, edges));

  return errors;
};

export default validateWorkflow; 