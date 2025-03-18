import React from 'react';
import { Card, List, Tag, Typography, Button } from 'antd';
import { Panel } from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '../types';
import { ExecutionStatus } from '../utils/workflowExecutor';
import '../styles/executionStatus.css';
import { CloseOutlined } from '@ant-design/icons';

interface ExecutionStatusPanelProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: Record<string, ExecutionStatus>;
  onClose: () => void;
}

const ExecutionStatusPanel: React.FC<ExecutionStatusPanelProps> = ({
  nodes,
  edges,
  status,
  onClose,
}) => {
  const getStatusColor = (status: ExecutionStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'running':
        return 'processing';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: ExecutionStatus['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'running':
        return '运行中';
      case 'completed':
        return '已完成';
      case 'error':
        return '失败';
      default:
        return '未知';
    }
  };

  return (
    <Panel position="bottom-right" className="execution-status-panel">
      <div className="execution-status-content">
        <div className="execution-status-header">
          <span>执行状态</span>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
        <div className="execution-status-list">
          {nodes.map((node) => {
            const nodeStatus = status[node.id];
            return (
              <div key={node.id} className="execution-status-item">
                <div className="execution-status-node">
                  <span className="node-label">{node.data.label}</span>
                  <Tag color={getStatusColor(nodeStatus?.status)}>
                    {getStatusText(nodeStatus?.status)}
                  </Tag>
                </div>
                {nodeStatus?.message && (
                  <div className="execution-status-message">
                    {nodeStatus.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};

export default ExecutionStatusPanel; 