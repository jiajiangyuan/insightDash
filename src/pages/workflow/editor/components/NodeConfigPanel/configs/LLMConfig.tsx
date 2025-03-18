import React from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';

const { Option } = Select;

const LLMConfig: React.FC = () => {
  return (
    <div className="config-section">
      <Form.Item
        label="模型"
        name="model"
        rules={[{ required: true, message: '请选择语言模型' }]}
      >
        <Select placeholder="请选择语言模型">
          <Option value="gpt-4">GPT-4</Option>
          <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
          <Option value="claude-2">Claude 2</Option>
          <Option value="claude-instant">Claude Instant</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="系统提示词"
        name="systemPrompt"
        tooltip="设置模型的行为和角色定位"
      >
        <Input.TextArea
          placeholder="请输入系统提示词"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item
        label="温度"
        name="temperature"
        tooltip="控制输出的随机性，0表示最确定，1表示最随机"
        rules={[{ required: true, message: '请设置温度参数' }]}
      >
        <InputNumber
          min={0}
          max={1}
          step={0.1}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="最大长度"
        name="maxTokens"
        tooltip="限制模型输出的最大token数量"
      >
        <InputNumber
          min={1}
          max={4096}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="流式输出"
        name="streaming"
        valuePropName="checked"
        tooltip="启用流式输出可以实时获取模型的响应"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="停止序列"
        name="stopSequences"
        tooltip="设置模型停止生成的标记序列"
      >
        <Select
          mode="tags"
          placeholder="请输入停止序列"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="频率惩罚"
        name="frequencyPenalty"
        tooltip="控制模型重复使用相同词语的倾向，值越大越不倾向重复"
      >
        <InputNumber
          min={-2}
          max={2}
          step={0.1}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="存在惩罚"
        name="presencePenalty"
        tooltip="控制模型谈论新主题的倾向，值越大越倾向于谈论新主题"
      >
        <InputNumber
          min={-2}
          max={2}
          step={0.1}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
};

export default LLMConfig; 