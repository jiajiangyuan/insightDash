import React from 'react';
import { Card, Tooltip } from 'antd';
import {
  ApiOutlined,
  RobotOutlined,
  FileTextOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  RetweetOutlined,
} from '@ant-design/icons';
import { NodeTypes } from './types';
import './styles/toolbar.css';

const nodeTypes = [
  {
    type: NodeTypes.INPUT,
    label: '输入节点',
    icon: <ApiOutlined />,
    description: '接收外部输入数据',
  },
  {
    type: NodeTypes.OUTPUT,
    label: '输出节点',
    icon: <ApiOutlined />,
    description: '输出处理结果',
  },
  {
    type: NodeTypes.LLM,
    label: 'LLM节点',
    icon: <RobotOutlined />,
    description: '调用大语言模型',
  },
  {
    type: NodeTypes.PROMPT,
    label: 'Prompt节点',
    icon: <FileTextOutlined />,
    description: '定义提示模板',
  },
  {
    type: NodeTypes.CONDITION,
    label: '条件节点',
    icon: <BranchesOutlined />,
    description: '条件判断和分支',
  },
  {
    type: NodeTypes.DATA_PROCESS,
    label: '数据处理',
    icon: <DatabaseOutlined />,
    description: '数据转换和处理',
  },
  {
    type: NodeTypes.LOOP,
    label: '循环节点',
    icon: <RetweetOutlined />,
    description: '循环处理数据',
  },
];

interface ToolbarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeTypes) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onDragStart }) => {
  return (
    <div className="workflow-toolbar">
      <div className="toolbar-title">节点类型</div>
      <div className="toolbar-nodes">
        {nodeTypes.map((node) => (
          <Tooltip key={node.type} title={node.description} placement="right">
            <Card
              size="small"
              className="node-item"
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <div className="node-item-content">
                <span className="node-item-icon">{node.icon}</span>
                <span className="node-item-label">{node.label}</span>
              </div>
            </Card>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default Toolbar; 