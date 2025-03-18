import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const DataConfig: React.FC = () => {
  return (
    <div className="config-section">
      <Form.Item
        label="操作类型"
        name="operationType"
        rules={[{ required: true, message: '请选择操作类型' }]}
      >
        <Select placeholder="请选择操作类型">
          <Option value="transform">数据转换</Option>
          <Option value="filter">数据过滤</Option>
          <Option value="aggregate">数据聚合</Option>
          <Option value="sort">数据排序</Option>
          <Option value="join">数据合并</Option>
          <Option value="split">数据拆分</Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.operationType !== currentValues.operationType
        }
      >
        {({ getFieldValue }) => {
          const operationType = getFieldValue('operationType');
          
          switch (operationType) {
            case 'transform':
              return (
                <>
                  <Form.Item
                    label="转换规则"
                    name="transformRule"
                    tooltip="使用 JavaScript 表达式定义转换规则"
                    rules={[{ required: true, message: '请输入转换规则' }]}
                  >
                    <TextArea
                      placeholder="例如: data.map(item => ({ ...item, price: item.price * 2 }))"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                  </Form.Item>
                </>
              );
            
            case 'filter':
              return (
                <>
                  <Form.Item
                    label="过滤条件"
                    name="filterCondition"
                    tooltip="使用 JavaScript 表达式定义过滤条件"
                    rules={[{ required: true, message: '请输入过滤条件' }]}
                  >
                    <TextArea
                      placeholder="例如: item => item.price > 100"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                </>
              );

            case 'aggregate':
              return (
                <>
                  <Form.List name="aggregations">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'field']}
                              rules={[{ required: true, message: '请输入字段名' }]}
                            >
                              <Input placeholder="字段名" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'operation']}
                              rules={[{ required: true, message: '请选择聚合操作' }]}
                            >
                              <Select style={{ width: 120 }} placeholder="聚合操作">
                                <Option value="sum">求和</Option>
                                <Option value="avg">平均值</Option>
                                <Option value="max">最大值</Option>
                                <Option value="min">最小值</Option>
                                <Option value="count">计数</Option>
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'alias']}
                            >
                              <Input placeholder="结果别名" />
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
                            添加聚合规则
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              );

            case 'sort':
              return (
                <>
                  <Form.List name="sortRules">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'field']}
                              rules={[{ required: true, message: '请输入字段名' }]}
                            >
                              <Input placeholder="字段名" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'order']}
                              rules={[{ required: true, message: '请选择排序方式' }]}
                            >
                              <Select style={{ width: 120 }}>
                                <Option value="asc">升序</Option>
                                <Option value="desc">降序</Option>
                              </Select>
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
                            添加排序规则
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

      <Form.Item
        label="输出字段映射"
        name="outputMapping"
        tooltip="定义如何映射输出字段"
      >
        <TextArea
          placeholder="例如: { total: result.sum, average: result.avg }"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>
    </div>
  );
};

export default DataConfig; 