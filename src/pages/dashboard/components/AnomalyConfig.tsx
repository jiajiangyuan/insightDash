import React, { useEffect } from 'react';
import { Card, Form, Switch, Button, Select, InputNumber, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import type { AnomalyDetectionConfig } from '@/services/anomalyDetection';
import { updateAnomalyConfig } from '@/services/anomalyDetection';

const { Option } = Select;

const AnomalyConfig: React.FC = () => {
  const [form] = Form.useForm();
  const { anomalyConfig, anomalyLoading, setAnomalyConfig, fetchAnomalyConfig, fetchAnomalies } = useModel('dashboard');

  useEffect(() => {
    fetchAnomalyConfig();
  }, []);

  useEffect(() => {
    if (anomalyConfig) {
      form.setFieldsValue(anomalyConfig);
    }
  }, [anomalyConfig]);

  const handleSubmit = async (values: AnomalyDetectionConfig) => {
    try {
      await updateAnomalyConfig(values);
      setAnomalyConfig(values);
      message.success('更新配置成功');
      // 强制刷新异常数据
      fetchAnomalies(true);
    } catch (error) {
      message.error('更新配置失败');
      console.error('更新配置失败:', error);
    }
  };

  return (
    <Card title="异常检测配置" loading={anomalyLoading}>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          enabled: true,
          rules: [],
        }}
      >
        <Form.Item
          name="enabled"
          label="启用异常检测"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.List name="rules">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'metric']}
                    rules={[{ required: true, message: '请选择指标' }]}
                  >
                    <Select style={{ width: 120 }} placeholder="选择指标">
                      <Option value="responseTime">响应时间</Option>
                      <Option value="errorRate">错误率</Option>
                      <Option value="requestCount">请求数</Option>
                      <Option value="cpuUsage">CPU使用率</Option>
                      <Option value="memoryUsage">内存使用率</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'method']}
                    rules={[{ required: true, message: '请选择检测方法' }]}
                  >
                    <Select style={{ width: 120 }} placeholder="检测方法">
                      <Option value="zscore">Z-Score</Option>
                      <Option value="iqr">IQR</Option>
                      <Option value="percentile">百分位数</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => {
                      const prevMethod = prevValues.rules?.[name]?.method;
                      const currentMethod = currentValues.rules?.[name]?.method;
                      return prevMethod !== currentMethod;
                    }}
                  >
                    {({ getFieldValue }) => {
                      const method = getFieldValue(['rules', name, 'method']);
                      return (
                        <Form.Item
                          {...restField}
                          name={[name, 'params', method]}
                          rules={[{ required: true, message: '请设置参数' }]}
                        >
                          <InputNumber
                            placeholder={
                              method === 'zscore'
                                ? 'Z-Score阈值'
                                : method === 'iqr'
                                ? 'IQR倍数'
                                : '百分位数'
                            }
                          />
                        </Form.Item>
                      );
                    }}
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'thresholds', 'warning']}
                    rules={[{ required: true, message: '请设置警告阈值' }]}
                  >
                    <InputNumber placeholder="警告阈值" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'thresholds', 'critical']}
                    rules={[{ required: true, message: '请设置严重阈值' }]}
                  >
                    <InputNumber placeholder="严重阈值" />
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
                  添加规则
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AnomalyConfig; 