import { useCallback, useReducer, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { HistoryState, HistoryAction, HistoryItem } from '../types/history';
import { WorkflowTemplate } from '../types/workflow';
import { v4 as uuidv4 } from 'uuid';

// 历史记录 reducer
const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case 'ADD':
      // 删除当前版本之后的所有版本
      const newItems = state.items.slice(0, state.currentIndex + 1);
      // 添加新版本
      newItems.push(action.payload);
      // 如果超出最大数量限制，删除最早的版本
      if (newItems.length > state.maxItems) {
        newItems.shift();
      }
      return {
        ...state,
        items: newItems,
        currentIndex: newItems.length - 1,
      };
    case 'UNDO':
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };
    case 'REDO':
      return {
        ...state,
        currentIndex: Math.min(state.items.length - 1, state.currentIndex + 1),
      };
    case 'CLEAR':
      return {
        ...state,
        items: [],
        currentIndex: -1,
      };
    case 'SET_CURRENT':
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(state.items.length - 1, action.payload)),
      };
    default:
      return state;
  }
};

// 历史记录 Hook
export const useWorkflowHistory = (maxItems: number = 50) => {
  const [state, dispatch] = useReducer(historyReducer, {
    items: [],
    currentIndex: -1,
    maxItems,
  });

  // 防抖定时器
  const debounceTimer = useRef<NodeJS.Timeout>();

  // 添加历史记录
  const addHistory = useCallback(
    (nodes: Node[], edges: Edge[], description?: string, template?: WorkflowTemplate) => {
      // 清除之前的定时器
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // 设置新的定时器
      debounceTimer.current = setTimeout(() => {
        const historyItem: HistoryItem = {
          id: uuidv4(),
          timestamp: new Date(),
          nodes,
          edges,
          description,
          template,
        };

        dispatch({ type: 'ADD', payload: historyItem });
      }, 500); // 500ms 防抖
    },
    []
  );

  // 撤销
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  // 重做
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  // 跳转到指定版本
  const goToVersion = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT', payload: index });
  }, []);

  // 获取当前版本
  const getCurrentVersion = useCallback(() => {
    return state.items[state.currentIndex];
  }, [state.items, state.currentIndex]);

  // 获取所有版本
  const getAllVersions = useCallback(() => {
    return state.items;
  }, [state.items]);

  // 检查是否可以撤销
  const canUndo = state.currentIndex > 0;

  // 检查是否可以重做
  const canRedo = state.currentIndex < state.items.length - 1;

  return {
    addHistory,
    undo,
    redo,
    clearHistory,
    goToVersion,
    getCurrentVersion,
    getAllVersions,
    canUndo,
    canRedo,
    currentIndex: state.currentIndex,
    totalVersions: state.items.length,
  };
}; 