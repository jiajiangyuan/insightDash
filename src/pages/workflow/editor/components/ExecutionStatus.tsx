import React from 'react';
import { Card, List, Tag, Space, Progress } from 'antd';
import { ExecutionStatus } from '../utils/workflowExecutor';

interface ExecutionStatusPanelProps {
  nodes: any[];
  edges: any[];
  status: ExecutionStatus[];
}

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
      return '执行中';
    case 'completed':
      return '已完成';
    case 'error':
      return '错误';
    default:
      return '未知';
  }
};

const ExecutionStatusPanel: React.FC<ExecutionStatusPanelProps> = ({
  nodes,
  edges,
  status,
}) => {
  return (
    <Card title="执行状态" style={{ width: 300, height: '100%', overflow: 'auto' }}>
      <List
        dataSource={status}
        renderItem={(item) => {
          const node = nodes.find(n => n.id === item.nodeId);
          return (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Tag color={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Tag>
                  <span>{node?.data?.label || item.nodeId}</span>
                </Space>
                <Progress
                  percent={item.progress}
                  size="small"
                  status={item.status === 'error' ? 'exception' : undefined}
                />
                {item.message && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.message}
                  </div>
                )}
                {item.error && (
                  <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                    {item.error}
                  </div>
                )}
                {item.startTime && item.endTime && (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    耗时: {((item.endTime.getTime() - item.startTime.getTime()) / 1000).toFixed(2)}秒
                  </div>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default ExecutionStatusPanel; 