import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, Tag } from 'antd';
import { WorkflowNode } from '../types';

const baseNodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  width: 180,
  fontSize: '12px',
};

const nodeColors = {
  input: '#1890ff',
  output: '#52c41a',
  llm: '#722ed1',
  prompt: '#faad14',
  data: '#13c2c2',
  default: '#d9d9d9',
};

export const InputNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.input }}>
    <Handle type="source" position={Position.Right} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.input}>输入</Tag>
      <div>{data.label}</div>
    </div>
  </Card>
);

export const OutputNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.output }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.output}>输出</Tag>
      <div>{data.label}</div>
    </div>
  </Card>
);

export const LLMNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.llm }}>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.llm}>LLM</Tag>
      <div>{data.label}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>
        {data.config.model || '未选择模型'}
      </div>
    </div>
  </Card>
);

export const PromptNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.prompt }}>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.prompt}>提示词</Tag>
      <div>{data.label}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>
        {data.config.template || '未设置模板'}
      </div>
    </div>
  </Card>
);

export const DataNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.data }}>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.data}>数据</Tag>
      <div>{data.label}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>
        {data.config.type || '未设置类型'}
      </div>
    </div>
  </Card>
);

export const DefaultNode: React.FC<{ data: WorkflowNode['data'] }> = ({ data }) => (
  <Card style={{ ...baseNodeStyle, borderColor: nodeColors.default }}>
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div style={{ textAlign: 'center' }}>
      <Tag color={nodeColors.default}>默认</Tag>
      <div>{data.label}</div>
    </div>
  </Card>
); 