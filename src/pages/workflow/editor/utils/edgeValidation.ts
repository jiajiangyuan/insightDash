import { Edge, Node } from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '../types';

export interface EdgeValidationError {
  message: string;
  edgeId: string;
  severity: 'error' | 'warning';
}

export interface EdgeValidationResult {
  isValid: boolean;
  errors: EdgeValidationError[];
}

export const validateEdge = (
  edge: WorkflowEdge,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): EdgeValidationResult => {
  const errors: EdgeValidationError[] = [];

  // 检查源节点和目标节点是否存在
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  if (!sourceNode || !targetNode) {
    errors.push({
      message: '源节点或目标节点不存在',
      edgeId: edge.id,
      severity: 'error',
    });
    return { isValid: false, errors };
  }

  // 检查节点类型兼容性
  if (!isNodeTypeCompatible(sourceNode.type, targetNode.type)) {
    errors.push({
      message: `节点类型不兼容: ${sourceNode.type} -> ${targetNode.type}`,
      edgeId: edge.id,
      severity: 'error',
    });
  }

  // 检查循环连接
  if (hasCycle(edge, edges)) {
    errors.push({
      message: '检测到循环连接',
      edgeId: edge.id,
      severity: 'error',
    });
  }

  // 检查连接规则
  if (!isValidConnection(sourceNode, targetNode)) {
    errors.push({
      message: '违反连接规则',
      edgeId: edge.id,
      severity: 'error',
    });
  }

  // 检查连线样式
  if (edge.data?.style === 'custom' && (!edge.data.controlPoints || edge.data.controlPoints.length === 0)) {
    errors.push({
      message: '自定义连线样式需要至少一个控制点',
      edgeId: edge.id,
      severity: 'warning',
    });
  }

  // 检查连线标签
  if (edge.data?.label && edge.data.label.length > 50) {
    errors.push({
      message: '连线标签长度不能超过50个字符',
      edgeId: edge.id,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 检查节点类型兼容性
const isNodeTypeCompatible = (sourceType: string, targetType: string): boolean => {
  const compatibilityMap: Record<string, string[]> = {
    input: ['llm', 'prompt', 'function', 'api'],
    llm: ['output', 'condition', 'loop'],
    prompt: ['llm', 'function', 'api'],
    function: ['output', 'condition', 'loop'],
    api: ['output', 'condition', 'loop'],
    condition: ['output', 'llm', 'prompt', 'function', 'api'],
    loop: ['output', 'llm', 'prompt', 'function', 'api'],
  };

  return compatibilityMap[sourceType]?.includes(targetType) || false;
};

// 检查是否存在循环
const hasCycle = (newEdge: WorkflowEdge, existingEdges: WorkflowEdge[]): boolean => {
  const graph = new Map<string, Set<string>>();
  
  // 构建图
  [...existingEdges, newEdge].forEach(edge => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, new Set());
    }
    graph.get(edge.source)?.add(edge.target);
  });

  // 深度优先搜索检测循环
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (node: string): boolean => {
    if (!visited.has(node)) {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && dfs(neighbor)) {
            return true;
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
    }
    recursionStack.delete(node);
    return false;
  };

  return dfs(newEdge.source);
};

// 检查连接规则
const isValidConnection = (sourceNode: WorkflowNode, targetNode: WorkflowNode): boolean => {
  // 不允许自连接
  if (sourceNode.id === targetNode.id) {
    return false;
  }

  // 输出节点只能作为目标节点
  if (sourceNode.type === 'output') {
    return false;
  }

  // 输入节点只能作为源节点
  if (targetNode.type === 'input') {
    return false;
  }

  // 条件节点和循环节点不能直接连接
  if ((sourceNode.type === 'condition' || sourceNode.type === 'loop') &&
      (targetNode.type === 'condition' || targetNode.type === 'loop')) {
    return false;
  }

  return true;
};

// 批量验证所有连线
export const validateAllEdges = (
  edges: WorkflowEdge[],
  nodes: WorkflowNode[]
): EdgeValidationResult => {
  const errors: EdgeValidationError[] = [];
  
  edges.forEach(edge => {
    const result = validateEdge(edge, nodes, edges);
    errors.push(...result.errors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 