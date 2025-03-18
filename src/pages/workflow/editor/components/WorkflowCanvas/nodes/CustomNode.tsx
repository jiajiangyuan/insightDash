import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, Badge, Tooltip } from 'antd';
import {
  ApiOutlined,
  RobotOutlined,
  FileTextOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  RetweetOutlined,
} from '@ant-design/icons';
import { NodeTypes } from '../types';
import '../styles/node.css';

const nodeIcons = {
  [NodeTypes.INPUT]: <ApiOutlined />,
  [NodeTypes.OUTPUT]: <ApiOutlined />,
  [NodeTypes.LLM]: <RobotOutlined />,
  [NodeTypes.PROMPT]: <FileTextOutlined />,
  [NodeTypes.CONDITION]: <BranchesOutlined />,
  [NodeTypes.DATA_PROCESS]: <DatabaseOutlined />,
  [NodeTypes.LOOP]: <RetweetOutlined />,
};

const nodeColors = {
  [NodeTypes.INPUT]: '#52c41a',
  [NodeTypes.OUTPUT]: '#1890ff',
  [NodeTypes.LLM]: '#722ed1',
  [NodeTypes.PROMPT]: '#fa8c16',
  [NodeTypes.CONDITION]: '#eb2f96',
  [NodeTypes.DATA_PROCESS]: '#13c2c2',
  [NodeTypes.LOOP]: '#2f54eb',
};

const statusColors = {
  idle: '#d9d9d9',
  running: '#1890ff',
  success: '#52c41a',
  error: '#ff4d4f',
};

const CustomNode: React.FC<NodeProps> = memo(({ data, isConnectable }) => {
  const { label, type, status = 'idle', error } = data;
  const icon = nodeIcons[type as NodeTypes];
  const color = nodeColors[type as NodeTypes];

  return (
    <div className="custom-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Tooltip title={error} open={status === 'error'}>
        <Badge
          status={status}
          color={statusColors[status]}
          className="node-status"
        >
          <Card
            size="small"
            className="node-card"
            style={{ borderColor: color }}
          >
            <div className="node-content">
              <div className="node-icon" style={{ color }}>
                {icon}
              </div>
              <div className="node-label">{label}</div>
            </div>
          </Card>
        </Badge>
      </Tooltip>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode; 