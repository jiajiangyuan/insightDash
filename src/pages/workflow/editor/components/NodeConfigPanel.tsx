import React from 'react';
import { Form, Input, InputNumber, Select, Card, Button, Space, message, Modal } from 'antd';
import { WorkflowNode, NodeType } from '../types';

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

  const handleValuesChange = async (changedValues: any) => {
    try {
      // 触发表单验证
      await form.validateFields();
      onUpdate(node.id, {
        ...node.data,
        ...changedValues,
      });
    } catch (error) {
      // 验证失败不更新节点
      console.error('表单验证失败:', error);
    }
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'input':
        return (
          <>
            <Form.Item 
              name="dataType" 
              label="数据类型"
              rules={[{ required: true, message: '请选择数据类型' }]}
            >
              <Select>
                <Select.Option value="text">文本</Select.Option>
                <Select.Option value="json">JSON</Select.Option>
                <Select.Option value="file">文件</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item 
              name="required" 
              label="是否必填"
              rules={[{ required: true, message: '请选择是否必填' }]}
            >
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'llm':
        return (
          <>
            <Form.Item 
              name="model" 
              label="模型"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select>
                <Select.Option value="gpt-3.5-turbo">GPT-3.5</Select.Option>
                <Select.Option value="gpt-4">GPT-4</Select.Option>
                <Select.Option value="claude-2">Claude-2</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item 
              name="temperature" 
              label="温度"
              rules={[
                { required: true, message: '请输入温度值' },
                { type: 'number', min: 0, max: 1, message: '温度值必须在0-1之间' }
              ]}
            >
              <InputNumber min={0} max={1} step={0.1} />
            </Form.Item>
            <Form.Item 
              name="maxTokens" 
              label="最大Token"
              rules={[
                { required: true, message: '请输入最大Token数' },
                { type: 'number', min: 1, max: 4096, message: 'Token数必须在1-4096之间' }
              ]}
            >
              <InputNumber min={1} max={4096} />
            </Form.Item>
          </>
        );

      case 'prompt':
        return (
          <>
            <Form.Item 
              name="template" 
              label="提示词模板"
              rules={[
                { required: true, message: '请输入提示词模板' },
                { min: 10, message: '提示词模板至少10个字符' }
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item 
              name="variables" 
              label="变量"
              rules={[{ required: true, message: '请添加至少一个变量' }]}
            >
              <Select mode="tags" />
            </Form.Item>
          </>
        );

      case 'condition':
        return (
          <>
            <Form.Item 
              name="condition" 
              label="条件表达式"
              rules={[
                { required: true, message: '请输入条件表达式' },
                { 
                  validator: async (_, value) => {
                    if (!value?.includes('{{') || !value?.includes('}}')) {
                      throw new Error('条件表达式必须包含变量，格式如：{{variable}}');
                    }
                  }
                }
              ]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item 
              name="trueBranch" 
              label="True分支"
              rules={[{ required: true, message: '请输入True分支名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="falseBranch" 
              label="False分支"
              rules={[{ required: true, message: '请输入False分支名称' }]}
            >
              <Input />
            </Form.Item>
          </>
        );

      case 'loop':
        return (
          <>
            <Form.Item 
              name="condition" 
              label="循环条件"
              rules={[
                { required: true, message: '请输入循环条件' },
                { 
                  validator: async (_, value) => {
                    if (!value?.includes('{{') || !value?.includes('}}')) {
                      throw new Error('循环条件必须包含变量，格式如：{{variable}}');
                    }
                  }
                }
              ]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item 
              name="maxIterations" 
              label="最大迭代次数"
              rules={[
                { required: true, message: '请输入最大迭代次数' },
                { type: 'number', min: 1, max: 100, message: '迭代次数必须在1-100之间' }
              ]}
            >
              <InputNumber min={1} max={100} />
            </Form.Item>
          </>
        );

      case 'function':
        return (
          <>
            <Form.Item 
              name="functionName" 
              label="函数名称"
              rules={[
                { required: true, message: '请输入函数名称' },
                { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '函数名称必须是有效的标识符' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="parameters" 
              label="参数"
              rules={[
                { required: true, message: '请输入参数' },
                {
                  validator: async (_, value) => {
                    try {
                      if (value) JSON.parse(value);
                    } catch (e) {
                      throw new Error('参数必须是有效的JSON格式');
                    }
                  }
                }
              ]}
            >
              <Input.TextArea rows={4} placeholder='{"param1": "value1", "param2": "value2"}' />
            </Form.Item>
          </>
        );

      case 'api':
        return (
          <>
            <Form.Item 
              name="endpoint" 
              label="接口地址"
              rules={[
                { required: true, message: '请输入接口地址' },
                { type: 'url', message: '请输入有效的URL' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="method" 
              label="请求方法"
              rules={[{ required: true, message: '请选择请求方法' }]}
            >
              <Select>
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item 
              name="headers" 
              label="请求头"
              rules={[
                {
                  validator: async (_, value) => {
                    try {
                      if (value) JSON.parse(value);
                    } catch (e) {
                      throw new Error('请求头必须是有效的JSON格式');
                    }
                  }
                }
              ]}
            >
              <Input.TextArea rows={2} placeholder='{"Content-Type": "application/json"}' />
            </Form.Item>
            <Form.Item 
              name="body" 
              label="请求体"
              rules={[
                {
                  validator: async (_, value) => {
                    if (form.getFieldValue('method') !== 'GET' && !value) {
                      throw new Error('非GET请求必须填写请求体');
                    }
                    try {
                      if (value) JSON.parse(value);
                    } catch (e) {
                      throw new Error('请求体必须是有效的JSON格式');
                    }
                  }
                }
              ]}
            >
              <Input.TextArea rows={4} placeholder='{"key": "value"}' />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个节点吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        onDelete(node.id);
        message.success('节点已删除');
      },
    });
  };

  return (
    <Card
      title="节点配置"
      style={{ width: 300, height: '100vh', overflowY: 'auto' }}
      extra={
        <Button danger onClick={handleDelete}>
          删除
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={node.data}
        onValuesChange={handleValuesChange}
      >
        <Form.Item 
          name="label" 
          label="节点名称"
          rules={[
            { required: true, message: '请输入节点名称' },
            { min: 2, max: 50, message: '节点名称长度必须在2-50个字符之间' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item 
          name="description" 
          label="描述"
          rules={[{ max: 200, message: '描述不能超过200个字符' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        {renderConfigFields()}
      </Form>
    </Card>
  );
};

export default NodeConfigPanel; 