import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowEdge } from '../types';

export interface ExecutionStatus {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
}

interface UseExecutionStatusProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const useExecutionStatus = ({ nodes, edges }: UseExecutionStatusProps) => {
  const [status, setStatus] = useState<ExecutionStatus[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // 初始化执行状态
  const initializeStatus = useCallback(() => {
    const initialStatus = nodes.map(node => ({
      nodeId: node.id,
      status: 'pending' as const,
      progress: 0,
    }));
    setStatus(initialStatus);
    setIsExecuting(false);
  }, [nodes]);

  // 更新节点状态
  const updateNodeStatus = useCallback((
    nodeId: string,
    update: Partial<ExecutionStatus>
  ) => {
    setStatus(prev => prev.map(item => 
      item.nodeId === nodeId ? { ...item, ...update } : item
    ));
  }, []);

  // 开始执行工作流
  const startExecution = useCallback(async () => {
    setIsExecuting(true);
    initializeStatus();

    // 获取入口节点（没有入边的节点）
    const entryNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // 执行工作流
    try {
      for (const node of entryNodes) {
        await executeNode(node.id);
      }
    } catch (error) {
      console.error('工作流执行错误:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  // 执行单个节点
  const executeNode = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // 更新节点状态为执行中
    updateNodeStatus(nodeId, {
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
    });

    try {
      // 模拟节点执行
      await simulateNodeExecution(node);

      // 更新节点状态为完成
      updateNodeStatus(nodeId, {
        status: 'completed',
        progress: 100,
        endTime: new Date().toISOString(),
      });

      // 获取并执行下一个节点
      const nextNodes = getNextNodes(nodeId);
      for (const nextNode of nextNodes) {
        await executeNode(nextNode.id);
      }
    } catch (error) {
      // 更新节点状态为错误
      updateNodeStatus(nodeId, {
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误',
        endTime: new Date().toISOString(),
      });
      throw error;
    }
  }, [nodes, edges, updateNodeStatus]);

  // 获取下一个要执行的节点
  const getNextNodes = useCallback((nodeId: string) => {
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    return outgoingEdges.map(edge => 
      nodes.find(node => node.id === edge.target)
    ).filter((node): node is WorkflowNode => node !== undefined);
  }, [nodes, edges]);

  // 模拟节点执行
  const simulateNodeExecution = async (node: WorkflowNode) => {
    const duration = Math.random() * 2000 + 1000; // 1-3秒随机执行时间
    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateNodeStatus(node.id, {
        progress: (i / steps) * 100,
        message: `执行进度: ${i * 10}%`,
      });
    }

    // 模拟条件节点的随机分支选择
    if (node.type === 'condition') {
      const randomChoice = Math.random() > 0.5;
      return {
        result: randomChoice,
        nextBranch: randomChoice ? node.data.trueBranch : node.data.falseBranch,
      };
    }
  };

  return {
    status,
    isExecuting,
    startExecution,
    updateNodeStatus,
  };
};

export default useExecutionStatus; 