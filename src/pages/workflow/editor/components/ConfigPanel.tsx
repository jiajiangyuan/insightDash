import React from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Space } from 'antd';
import { WorkflowNode } from '../types';

interface ConfigPanelProps {
  node: WorkflowNode | null;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ node }) => {
  const [form] = Form.useForm();

  if (!node) {
    return (
      <Card title="节点配置" style={{ height: '100%' }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          请选择一个节点进行配置
        </div>
      </Card>
    );
  }

  const handleValuesChange = (changedValues: any, allValues: any) => {
    // TODO: 实现配置更新逻辑
    console.log('配置更新:', changedValues, allValues);
  };

  return (
    <Card title="节点配置" style={{ height: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={node.data.config}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="节点名称"
          name="label"
          rules={[{ required: true, message: '请输入节点名称' }]}
        >
          <Input />
        </Form.Item>

        {node.type === 'llm' && (
          <>
            <Form.Item
              label="模型"
              name="model"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select>
                <Select.Option value="gpt-4">GPT-4</Select.Option>
                <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
                <Select.Option value="claude-2">Claude 2</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="温度"
              name="temperature"
              rules={[{ required: true, message: '请输入温度值' }]}
            >
              <InputNumber min={0} max={2} step={0.1} />
            </Form.Item>
          </>
        )}

        {node.type === 'prompt' && (
          <Form.Item
            label="提示词模板"
            name="template"
            rules={[{ required: true, message: '请输入提示词模板' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        )}

        {node.type === 'input' && (
          <Form.Item
            label="输入格式"
            name="format"
            rules={[{ required: true, message: '请选择输入格式' }]}
          >
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="text">文本</Select.Option>
              <Select.Option value="csv">CSV</Select.Option>
            </Select>
          </Form.Item>
        )}

        {node.type === 'output' && (
          <Form.Item
            label="输出格式"
            name="format"
            rules={[{ required: true, message: '请选择输出格式' }]}
          >
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="text">文本</Select.Option>
              <Select.Option value="markdown">Markdown</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ConfigPanel; 