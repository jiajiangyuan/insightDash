import React from 'react';
import { Form, Input, Select, Button, Space, Switch, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import './styles/ioConfig.css';

const { TextArea } = Input;
const { Option } = Select;

interface IOConfigProps {
  type: 'input' | 'output';
}

const IOConfig: React.FC<IOConfigProps> = ({ type }) => {
  const isInput = type === 'input';
  
  return (
    <div className="config-section">
      <Form layout="horizontal">
        <Form.Item
          label="数据格式"
          name="dataFormat"
          rules={[{ required: true, message: '请选择数据格式' }]}
        >
          <Select placeholder="请选择数据格式">
            <Option value="json">JSON</Option>
            <Option value="text">纯文本</Option>
            <Option value="number">数字</Option>
            <Option value="boolean">布尔值</Option>
            <Option value="array">数组</Option>
            <Option value="object">对象</Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.dataFormat !== currentValues.dataFormat
          }
        >
          {({ getFieldValue }) => {
            const dataFormat = getFieldValue('dataFormat');
            
            if (dataFormat === 'object') {
              return (
                <div className="field-list">
                  <div className="config-section-title">字段定义</div>
                  <Form.List name="fields">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} className="field-list-item">
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="字段名"
                              rules={[{ required: true, message: '请输入字段名' }]}
                            >
                              <Input placeholder="字段名" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'type']}
                              label="类型"
                              rules={[{ required: true, message: '请选择字段类型' }]}
                            >
                              <Select>
                                <Option value="string">文本</Option>
                                <Option value="number">数字</Option>
                                <Option value="boolean">布尔值</Option>
                                <Option value="array">数组</Option>
                                <Option value="object">对象</Option>
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'required']}
                              label="必填"
                              valuePropName="checked"
                            >
                              <Switch checkedChildren="是" unCheckedChildren="否" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'description']}
                              label="描述"
                            >
                              <Input placeholder="字段描述（选填）" />
                            </Form.Item>
                            <div className="field-actions">
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(name)}
                              />
                            </div>
                          </div>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            添加字段
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              );
            }

            if (dataFormat === 'array') {
              return (
                <div className="field-list">
                  <Form.Item
                    label="元素类型"
                    name="elementType"
                    rules={[{ required: true, message: '请选择数组元素类型' }]}
                  >
                    <Select placeholder="请选择数组元素类型">
                      <Option value="string">文本</Option>
                      <Option value="number">数字</Option>
                      <Option value="boolean">布尔值</Option>
                      <Option value="object">对象</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="最小长度"
                    name="minLength"
                  >
                    <Input type="number" min={0} placeholder="最小元素数量" />
                  </Form.Item>
                  <Form.Item
                    label="最大长度"
                    name="maxLength"
                  >
                    <Input type="number" min={0} placeholder="最大元素数量" />
                  </Form.Item>
                </div>
              );
            }

            return null;
          }}
        </Form.Item>

        {isInput && (
          <>
            <Divider />
            <div className="config-section-title">验证规则</div>
            
            <Form.Item
              label="必填"
              name="required"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item
              label="默认值"
              name="defaultValue"
              tooltip="当没有输入值时使用的默认值"
            >
              <TextArea
                placeholder="请输入默认值（JSON格式）"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <Form.Item
              label="验证表达式"
              name="validation"
              tooltip="使用JavaScript表达式验证输入值，返回true表示验证通过"
            >
              <TextArea
                placeholder="例如: value.length >= 3 && value.length <= 100"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <Form.Item
              label="错误提示"
              name="errorMessage"
              tooltip="验证失败时显示的错误信息"
            >
              <Input placeholder="请输入验证失败时的错误提示" />
            </Form.Item>
          </>
        )}

        {!isInput && (
          <>
            <Divider />
            <div className="config-section-title">输出处理</div>

            <Form.Item
              label="格式化输出"
              name="formatOutput"
              valuePropName="checked"
              tooltip="是否对输出进行格式化处理"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item
              label="转换表达式"
              name="transform"
              tooltip="使用JavaScript表达式转换输出值"
            >
              <TextArea
                placeholder="例如: JSON.stringify(value, null, 2)"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <Form.Item
              label="缓存结果"
              name="cache"
              valuePropName="checked"
              tooltip="是否缓存输出结果"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="示例数据"
          name="example"
          tooltip="提供一个示例数据，帮助理解数据格式"
        >
          <TextArea
            placeholder="请输入示例数据（JSON格式）"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          label="备注说明"
          name="notes"
          tooltip="关于这个节点的补充说明"
        >
          <TextArea
            placeholder="请输入补充说明"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default IOConfig; 