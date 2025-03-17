import React from 'react';
import { Card, Typography } from 'antd';
import { 
  ApiOutlined, 
  CodeOutlined, 
  DatabaseOutlined, 
  FunctionOutlined, 
  RobotOutlined, 
  SendOutlined, 
  SyncOutlined,
  BranchesOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { WorkflowNode } from '../types';

const { Title } = Typography;

const nodeTypes = [
  {
    type: 'input',
    label: '输入节点',
    description: '工作流的起点,用于接收输入数据',
    icon: <SendOutlined />,
  },
  {
    type: 'output',
    label: '输出节点',
    description: '工作流的终点,用于输出结果',
    icon: <ApiOutlined />,
  },
  {
    type: 'llm',
    label: 'LLM节点',
    description: '调用大语言模型进行处理',
    icon: <RobotOutlined />,
  },
  {
    type: 'prompt',
    label: '提示词节点',
    description: '定义提示词模板',
    icon: <CodeOutlined />,
  },
  {
    type: 'data',
    label: '数据节点',
    description: '存储和处理数据',
    icon: <DatabaseOutlined />,
  },
  {
    type: 'condition',
    label: '条件节点',
    description: '根据条件进行分支处理',
    icon: <BranchesOutlined />,
  },
  {
    type: 'loop',
    label: '循环节点',
    description: '重复执行特定操作',
    icon: <ReloadOutlined />,
  },
  {
    type: 'function',
    label: '函数节点',
    description: '执行自定义函数',
    icon: <FunctionOutlined />,
  },
  {
    type: 'api',
    label: 'API节点',
    description: '调用外部API服务',
    icon: <ApiOutlined />,
  },
];

const NodePanel: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNode['type']) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
  };

  return (
    <div style={{ padding: 16 }}>
      <Title level={4}>节点类型</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nodeTypes.map((node) => (
          <Card
            key={node.type}
            size="small"
            draggable
            onDragStart={(e) => onDragStart(e, node.type as WorkflowNode['type'])}
            style={{ cursor: 'grab' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {node.icon}
              <div>
                <div>{node.label}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {node.description}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NodePanel; 