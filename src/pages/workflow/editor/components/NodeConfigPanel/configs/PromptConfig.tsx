import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const PromptConfig: React.FC = () => {
  return (
    <div className="config-section">
      <Form.Item
        label="提示词模板"
        name="template"
        tooltip="使用 {{变量名}} 来引用变量"
        rules={[{ required: true, message: '请输入提示词模板' }]}
      >
        <TextArea
          placeholder="请输入提示词模板，例如：请帮我总结以下内容：{{content}}"
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </Form.Item>

      <div className="config-section-title">变量定义</div>
      <Form.List name="variables">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[{ required: true, message: '请输入变量名' }]}
                >
                  <Input placeholder="变量名" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  rules={[{ required: true, message: '请选择变量类型' }]}
                >
                  <Select style={{ width: 120 }} placeholder="变量类型">
                    <Select.Option value="string">文本</Select.Option>
                    <Select.Option value="number">数字</Select.Option>
                    <Select.Option value="boolean">布尔值</Select.Option>
                    <Select.Option value="array">数组</Select.Option>
                    <Select.Option value="object">对象</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'description']}
                >
                  <Input placeholder="变量描述" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加变量
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        label="示例"
        name="examples"
        tooltip="提供一些示例帮助理解提示词模板的用法"
      >
        <TextArea
          placeholder="请输入使用示例"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      <Form.Item
        label="注意事项"
        name="notes"
        tooltip="关于这个提示词模板的使用说明和注意事项"
      >
        <TextArea
          placeholder="请输入注意事项"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>
    </div>
  );
};

export default PromptConfig; 