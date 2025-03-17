import { useCallback, useMemo, useRef } from 'react';
import { Edge } from 'reactflow';
import { WorkflowEdge } from '../types';

interface EdgeOptimizationOptions {
  maxEdges: number;
  animationEnabled: boolean;
  cacheEnabled: boolean;
  batchSize: number;
  debounceTime: number;
}

const DEFAULT_OPTIONS: EdgeOptimizationOptions = {
  maxEdges: 1000,
  animationEnabled: true,
  cacheEnabled: true,
  batchSize: 50,
  debounceTime: 100,
};

export const useEdgeOptimization = (options: Partial<EdgeOptimizationOptions> = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const edgeCache = useMemo(() => new Map<string, string>(), []);
  const renderQueue = useRef<WorkflowEdge[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 优化单个连线
  const optimizeEdge = useCallback((edge: WorkflowEdge): WorkflowEdge => {
    // 如果连线数量超过限制,禁用动画
    if (edge.data?.animated && !mergedOptions.animationEnabled) {
      return {
        ...edge,
        data: {
          ...edge.data,
          animated: false,
        },
      };
    }

    // 使用缓存
    if (mergedOptions.cacheEnabled) {
      const cacheKey = `${edge.source}-${edge.target}-${edge.data?.style}`;
      const cachedPath = edgeCache.get(cacheKey);
      if (cachedPath) {
        return {
          ...edge,
          data: {
            ...edge.data,
            path: cachedPath,
          },
        };
      }
    }

    return edge;
  }, [edgeCache, mergedOptions.animationEnabled, mergedOptions.cacheEnabled]);

  // 批量优化连线
  const optimizeEdges = useCallback((edges: WorkflowEdge[]): WorkflowEdge[] => {
    // 如果连线数量超过限制,进行优化
    if (edges.length > mergedOptions.maxEdges) {
      return edges.map(edge => optimizeEdge(edge));
    }
    return edges;
  }, [mergedOptions.maxEdges, optimizeEdge]);

  // 分批处理连线
  const processEdgeBatch = useCallback((edges: WorkflowEdge[]): WorkflowEdge[] => {
    const result: WorkflowEdge[] = [];
    for (let i = 0; i < edges.length; i += mergedOptions.batchSize) {
      const batch = edges.slice(i, i + mergedOptions.batchSize);
      const optimizedBatch = batch.map(edge => optimizeEdge(edge));
      result.push(...optimizedBatch);
    }
    return result;
  }, [mergedOptions.batchSize, optimizeEdge]);

  // 防抖处理连线更新
  const debouncedOptimizeEdges = useCallback((edges: WorkflowEdge[], callback: (edges: WorkflowEdge[]) => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    renderQueue.current = edges;

    timeoutRef.current = setTimeout(() => {
      const optimizedEdges = processEdgeBatch(renderQueue.current);
      callback(optimizedEdges);
    }, mergedOptions.debounceTime);
  }, [mergedOptions.debounceTime, processEdgeBatch]);

  // 清理缓存
  const clearCache = useCallback(() => {
    edgeCache.clear();
  }, [edgeCache]);

  // 清理定时器
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    optimizeEdge,
    optimizeEdges,
    processEdgeBatch,
    debouncedOptimizeEdges,
    clearCache,
    cleanup,
  };
}; 