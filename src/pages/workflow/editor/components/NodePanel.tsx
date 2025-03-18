import React from 'react';
import { Tooltip } from 'antd';
import {
  ApiOutlined,
  RobotOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import '../styles/nodePanel.css';

const nodeTypes = [
  {
    type: 'input',
    label: '输入节点',
    description: '工作流的起始节点，用于接收输入数据',
    icon: <ImportOutlined />,
    category: 'basic'
  },
  {
    type: 'llm',
    label: 'LLM节点',
    description: '语言模型节点，处理自然语言任务',
    icon: <RobotOutlined />,
    category: 'ai'
  },
  {
    type: 'prompt',
    label: 'Prompt节点',
    description: '提示词模板节点，用于生成或修改提示词',
    icon: <ApiOutlined />,
    category: 'ai'
  },
  {
    type: 'data',
    label: '数据节点',
    description: '数据处理节点，用于数据转换和处理',
    icon: <DatabaseOutlined />,
    category: 'data'
  },
  {
    type: 'condition',
    label: '条件节点',
    description: '条件判断节点，用于流程控制',
    icon: <BranchesOutlined />,
    category: 'control'
  },
  {
    type: 'loop',
    label: '循环节点',
    description: '循环处理节点，用于重复执行任务',
    icon: <ReloadOutlined />,
    category: 'control'
  },
  {
    type: 'output',
    label: '输出节点',
    description: '工作流的终止节点，用于输出结果',
    icon: <ExportOutlined />,
    category: 'basic'
  },
];

const categories = {
  basic: '基础节点',
  ai: 'AI节点',
  data: '数据处理',
  control: '流程控制'
};

const NodePanel: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-panel">
      {Object.entries(categories).map(([category, title]) => (
        <div key={category} className="node-category">
          <div className="category-title">{title}</div>
          <div className="category-content">
            {nodeTypes
              .filter(node => node.category === category)
              .map((type) => (
                <Tooltip key={type.type} title={type.description} placement="right">
                  <div
                    className="node-item"
                    draggable
                    onDragStart={(e) => onDragStart(e, type.type)}
                  >
                    <div className="node-item-icon">{type.icon}</div>
                    <div className="node-item-label">{type.label}</div>
                  </div>
                </Tooltip>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NodePanel; 