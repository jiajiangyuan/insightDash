import React from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface LoopConfigProps {
  config?: any;
  onChange?: (config: any) => void;
}

const LoopConfig: React.FC<LoopConfigProps> = ({ config, onChange }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_: any, allValues: any) => {
    onChange?.(allValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={config}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="循环类型"
        name="loopType"
        rules={[{ required: true, message: '请选择循环类型' }]}
      >
        <Select placeholder="请选择循环类型">
          <Option value="count">固定次数</Option>
          <Option value="collection">集合遍历</Option>
          <Option value="condition">条件循环</Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.loopType !== currentValues.loopType
        }
      >
        {({ getFieldValue }) => {
          const loopType = getFieldValue('loopType');

          switch (loopType) {
            case 'count':
              return (
                <>
                  <Form.Item
                    label="循环次数"
                    name="count"
                    rules={[{ required: true, message: '请输入循环次数' }]}
                  >
                    <InputNumber
                      min={1}
                      max={1000}
                      style={{ width: '100%' }}
                      placeholder="请输入循环次数"
                    />
                  </Form.Item>
                  <Form.Item
                    label="当前索引变量名"
                    name="indexVariable"
                    rules={[{ required: true, message: '请输入索引变量名' }]}
                  >
                    <Input placeholder="例如: i, index" />
                  </Form.Item>
                </>
              );

            case 'collection':
              return (
                <>
                  <Form.Item
                    label="集合表达式"
                    name="collection"
                    rules={[{ required: true, message: '请输入集合表达式' }]}
                    tooltip="输入一个返回数组的JavaScript表达式"
                  >
                    <TextArea
                      placeholder="例如: data.items"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="元素变量名"
                    name="itemVariable"
                    rules={[{ required: true, message: '请输入元素变量名' }]}
                  >
                    <Input placeholder="例如: item" />
                  </Form.Item>
                  <Form.Item
                    label="索引变量名"
                    name="indexVariable"
                  >
                    <Input placeholder="例如: i, index（可选）" />
                  </Form.Item>
                </>
              );

            case 'condition':
              return (
                <>
                  <Form.Item
                    label="循环条件"
                    name="condition"
                    rules={[{ required: true, message: '请输入循环条件' }]}
                    tooltip="输入一个返回布尔值的JavaScript表达式"
                  >
                    <TextArea
                      placeholder="例如: count < 10 && !isDone"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="更新表达式"
                    name="update"
                    rules={[{ required: true, message: '请输入更新表达式' }]}
                    tooltip="每次循环结束时执行的JavaScript表达式"
                  >
                    <TextArea
                      placeholder="例如: count++"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                </>
              );

            default:
              return null;
          }
        }}
      </Form.Item>

      <Form.Item
        label="最大循环次数"
        name="maxIterations"
        tooltip="防止无限循环的安全限制"
      >
        <InputNumber
          min={1}
          max={10000}
          style={{ width: '100%' }}
          placeholder="默认: 1000"
        />
      </Form.Item>

      <Form.Item
        label="并行执行"
        name="parallel"
        valuePropName="checked"
        tooltip="是否并行执行循环体（如果可能）"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="错误处理"
        name="errorHandling"
      >
        <Select placeholder="请选择错误处理方式">
          <Option value="break">中断循环</Option>
          <Option value="continue">继续下一次循环</Option>
          <Option value="throw">抛出错误</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="输出结果"
        name="output"
        tooltip="选择如何处理循环的输出结果"
      >
        <Select placeholder="请选择输出处理方式">
          <Option value="all">收集所有结果</Option>
          <Option value="last">仅保留最后结果</Option>
          <Option value="none">不保存结果</Option>
        </Select>
      </Form.Item>
    </Form>
  );
};

export default LoopConfig; 