import React from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { WorkflowNode } from '../../types';
import LLMConfig from './configs/LLMConfig';
import PromptConfig from './configs/PromptConfig';
import DataConfig from './configs/DataConfig';
import ConditionConfig from './configs/ConditionConfig';
import LoopConfig from './configs/LoopConfig';
import IOConfig from './configs/IOConfig';
import './styles.css';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdate,
  onDelete,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any) => {
    const newData = {
      ...node.data,
      ...changedValues,
    };
    onUpdate(node.id, newData);
  };

  const renderConfigByType = () => {
    switch (node.type) {
      case 'input':
      case 'output':
        return <IOConfig type={node.type} />;
      case 'llm':
        return <LLMConfig />;
      case 'prompt':
        return <PromptConfig />;
      case 'data':
        return <DataConfig />;
      case 'condition':
        return <ConditionConfig />;
      case 'loop':
        return <LoopConfig />;
      default:
        return null;
    }
  };

  return (
    <div className="node-config-panel">
      <Card
        title="节点配置"
        extra={
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(node.id)}
          />
        }
        className="config-card"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={node.data}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="节点名称"
            name="label"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input placeholder="请输入节点名称" />
          </Form.Item>
          
          <Form.Item
            label="节点描述"
            name="description"
          >
            <Input.TextArea
              placeholder="请输入节点描述"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />
          
          {renderConfigByType()}
        </Form>
      </Card>
    </div>
  );
};

export default NodeConfigPanel; 