import { NodeValidationRule, ConnectionRule, ParameterValidationRule } from '../types/validation';
import { WorkflowNodeType } from '../types/workflow';

// 节点连接规则
const connectionRules: Record<WorkflowNodeType, ConnectionRule[]> = {
  input: [
    {
      sourceType: 'input',
      targetTypes: ['llm', 'prompt', 'data', 'condition'],
      maxConnections: 1,
    },
  ],
  llm: [
    {
      sourceType: 'llm',
      targetTypes: ['llm', 'prompt', 'condition', 'output'],
      maxConnections: 1,
    },
  ],
  prompt: [
    {
      sourceType: 'prompt',
      targetTypes: ['llm', 'condition', 'output'],
      maxConnections: 1,
    },
  ],
  data: [
    {
      sourceType: 'data',
      targetTypes: ['llm', 'prompt', 'condition', 'output'],
      maxConnections: 1,
    },
  ],
  condition: [
    {
      sourceType: 'condition',
      targetTypes: ['llm', 'prompt', 'data', 'condition', 'output'],
      maxConnections: 2,
    },
  ],
  loop: [
    {
      sourceType: 'loop',
      targetTypes: ['llm', 'prompt', 'data', 'condition'],
      maxConnections: 1,
    },
  ],
  output: [
    {
      sourceType: 'output',
      targetTypes: [],
      maxConnections: 0,
    },
  ],
};

// 参数验证规则
const parameterRules: Record<WorkflowNodeType, Record<string, ParameterValidationRule>> = {
  input: {
    label: {
      name: 'label',
      type: 'string',
      required: true,
      pattern: '^[a-zA-Z0-9_-]+$',
      message: '标签只能包含字母、数字、下划线和连字符',
    },
  },
  llm: {
    model: {
      name: 'model',
      type: 'string',
      required: true,
      enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'],
      message: '请选择有效的模型',
    },
    temperature: {
      name: 'temperature',
      type: 'number',
      required: true,
      min: 0,
      max: 2,
      message: '温度值必须在0到2之间',
    },
    maxTokens: {
      name: 'maxTokens',
      type: 'number',
      required: false,
      min: 1,
      max: 4000,
      message: '最大token数必须在1到4000之间',
    },
  },
  prompt: {
    content: {
      name: 'content',
      type: 'string',
      required: true,
      message: '提示词内容不能为空',
    },
    variables: {
      name: 'variables',
      type: 'array',
      required: false,
      validate: (value) => Array.isArray(value) && value.every(v => typeof v === 'string'),
      message: '变量必须是字符串数组',
    },
  },
  data: {
    source: {
      name: 'source',
      type: 'string',
      required: true,
      message: '数据源不能为空',
    },
    format: {
      name: 'format',
      type: 'string',
      required: true,
      enum: ['json', 'csv', 'text'],
      message: '请选择有效的数据格式',
    },
  },
  condition: {
    expression: {
      name: 'expression',
      type: 'string',
      required: true,
      message: '条件表达式不能为空',
    },
    type: {
      name: 'type',
      type: 'string',
      required: true,
      enum: ['if', 'switch'],
      message: '请选择有效的条件类型',
    },
  },
  loop: {
    type: {
      name: 'type',
      type: 'string',
      required: true,
      enum: ['for', 'while', 'foreach'],
      message: '请选择有效的循环类型',
    },
    maxIterations: {
      name: 'maxIterations',
      type: 'number',
      required: false,
      min: 1,
      message: '最大迭代次数必须大于0',
    },
  },
  output: {
    format: {
      name: 'format',
      type: 'string',
      required: true,
      enum: ['json', 'text', 'table'],
      message: '请选择有效的输出格式',
    },
  },
};

// 节点验证规则
export const nodeValidationRules: Record<WorkflowNodeType, NodeValidationRule> = {
  input: {
    type: 'input',
    requiredParams: ['label'],
    paramRules: parameterRules.input,
    connectionRules: connectionRules.input,
  },
  llm: {
    type: 'llm',
    requiredParams: ['model', 'temperature'],
    paramRules: parameterRules.llm,
    connectionRules: connectionRules.llm,
  },
  prompt: {
    type: 'prompt',
    requiredParams: ['content'],
    paramRules: parameterRules.prompt,
    connectionRules: connectionRules.prompt,
  },
  data: {
    type: 'data',
    requiredParams: ['source', 'format'],
    paramRules: parameterRules.data,
    connectionRules: connectionRules.data,
  },
  condition: {
    type: 'condition',
    requiredParams: ['expression', 'type'],
    paramRules: parameterRules.condition,
    connectionRules: connectionRules.condition,
  },
  loop: {
    type: 'loop',
    requiredParams: ['type'],
    paramRules: parameterRules.loop,
    connectionRules: connectionRules.loop,
  },
  output: {
    type: 'output',
    requiredParams: ['format'],
    paramRules: parameterRules.output,
    connectionRules: connectionRules.output,
  },
}; 