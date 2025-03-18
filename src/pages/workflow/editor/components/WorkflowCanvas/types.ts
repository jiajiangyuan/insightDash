import { Node, Edge } from 'reactflow';

export enum NodeTypes {
  INPUT = 'input',
  OUTPUT = 'output',
  LLM = 'llm',
  PROMPT = 'prompt',
  CONDITION = 'condition',
  DATA_PROCESS = 'data_process',
  LOOP = 'loop'
}

export interface WorkflowNode extends Node {
  type: NodeTypes;
  data: {
    label: string;
    type: NodeTypes;
    config?: any;
    status?: 'idle' | 'running' | 'success' | 'error';
    error?: string;
  };
}

export interface WorkflowEdge extends Edge {
  type?: 'default' | 'straight' | 'step' | 'smoothstep';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface NodeData {
  label: string;
  type: NodeTypes;
  config?: any;
} 