import React from 'react';
import { Form, Input, Select, Button, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const ConditionConfig: React.FC = () => {
  return (
    <div className="config-section">
      <Form.Item
        label="条件类型"
        name="conditionType"
        rules={[{ required: true, message: '请选择条件类型' }]}
      >
        <Select placeholder="请选择条件类型">
          <Option value="expression">表达式条件</Option>
          <Option value="comparison">比较条件</Option>
          <Option value="multiple">多条件组合</Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.conditionType !== currentValues.conditionType
        }
      >
        {({ getFieldValue }) => {
          const conditionType = getFieldValue('conditionType');
          
          switch (conditionType) {
            case 'expression':
              return (
                <Form.Item
                  label="条件表达式"
                  name="expression"
                  tooltip="使用JavaScript表达式定义条件，返回true或false"
                  rules={[{ required: true, message: '请输入条件表达式' }]}
                >
                  <TextArea
                    placeholder="例如: data.score >= 60 && data.attendance > 0.8"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              );
            
            case 'comparison':
              return (
                <>
                  <Form.Item
                    label="比较字段"
                    name="field"
                    rules={[{ required: true, message: '请输入比较字段' }]}
                  >
                    <Input placeholder="输入要比较的字段名，例如：score" />
                  </Form.Item>
                  <Form.Item
                    label="比较操作符"
                    name="operator"
                    rules={[{ required: true, message: '请选择比较操作符' }]}
                  >
                    <Select placeholder="请选择比较操作符">
                      <Option value="eq">等于 (==)</Option>
                      <Option value="neq">不等于 (!=)</Option>
                      <Option value="gt">大于 (&gt;)</Option>
                      <Option value="gte">大于等于 (&gt;=)</Option>
                      <Option value="lt">小于 (&lt;)</Option>
                      <Option value="lte">小于等于 (&lt;=)</Option>
                      <Option value="contains">包含</Option>
                      <Option value="startsWith">开头是</Option>
                      <Option value="endsWith">结尾是</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="比较值"
                    name="value"
                    rules={[{ required: true, message: '请输入比较值' }]}
                  >
                    <Input placeholder="输入比较值" />
                  </Form.Item>
                </>
              );
            
            case 'multiple':
              return (
                <>
                  <Form.Item
                    label="组合方式"
                    name="combination"
                    rules={[{ required: true, message: '请选择组合方式' }]}
                  >
                    <Select placeholder="请选择条件组合方式">
                      <Option value="and">所有条件都满足 (AND)</Option>
                      <Option value="or">满足任一条件 (OR)</Option>
                    </Select>
                  </Form.Item>
                  <Form.List name="conditions">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div key={key} style={{ marginBottom: 16 }}>
                            <Space align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                              <Form.Item
                                {...restField}
                                name={[name, 'field']}
                                rules={[{ required: true, message: '请输入字段名' }]}
                              >
                                <Input placeholder="字段名" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'operator']}
                                rules={[{ required: true, message: '请选择操作符' }]}
                              >
                                <Select style={{ width: 120 }}>
                                  <Option value="eq">等于</Option>
                                  <Option value="neq">不等于</Option>
                                  <Option value="gt">大于</Option>
                                  <Option value="gte">大于等于</Option>
                                  <Option value="lt">小于</Option>
                                  <Option value="lte">小于等于</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                rules={[{ required: true, message: '请输入值' }]}
                              >
                                <Input placeholder="值" />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                          </div>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            添加条件
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              );
            
            default:
              return null;
          }
        }}
      </Form.Item>

      <Divider style={{ margin: '16px 0' }} />

      <div className="config-section-title">分支配置</div>
      
      <Form.Item
        label="True分支描述"
        name={['branches', 'true', 'description']}
        tooltip="当条件满足时执行的分支说明"
      >
        <Input placeholder="请输入条件满足时的分支说明" />
      </Form.Item>

      <Form.Item
        label="False分支描述"
        name={['branches', 'false', 'description']}
        tooltip="当条件不满足时执行的分支说明"
      >
        <Input placeholder="请输入条件不满足时的分支说明" />
      </Form.Item>

      <Form.Item
        label="默认分支"
        name="defaultBranch"
        tooltip="当条件判断出错时执行的分支"
      >
        <Select placeholder="请选择默认分支">
          <Option value="true">True分支</Option>
          <Option value="false">False分支</Option>
          <Option value="error">抛出错误</Option>
        </Select>
      </Form.Item>
    </div>
  );
};

export default ConditionConfig; 