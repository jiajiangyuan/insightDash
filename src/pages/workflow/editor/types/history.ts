import { Node, Edge } from 'reactflow';
import { WorkflowTemplate } from './workflow';

// 历史记录项类型
export interface HistoryItem {
  id: string;
  timestamp: Date;
  nodes: Node[];
  edges: Edge[];
  description?: string;
  template?: WorkflowTemplate;
}

// 历史记录状态类型
export interface HistoryState {
  items: HistoryItem[];
  currentIndex: number;
  maxItems: number;
}

// 历史记录操作类型
export type HistoryAction =
  | { type: 'ADD'; payload: HistoryItem }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }
  | { type: 'SET_CURRENT'; payload: number }; 