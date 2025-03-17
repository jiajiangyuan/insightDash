import React, { useState } from 'react';
import { Form, Input, InputNumber, Switch, Select, Button, Table, Space, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface AlertRule {
  key: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  duration: number;
  enabled: boolean;
}

const AlertSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [rules, setRules] = useState<AlertRule[]>([
    {
      key: '1',
      name: '响应时间过高',
      metric: 'response_time',
      condition: '>',
      threshold: 1000,
      duration: 5,
      enabled: true,
    },
    {
      key: '2',
      name: '错误率告警',
      metric: 'error_rate',
      condition: '>',
      threshold: 5,
      duration: 10,
      enabled: true,
    },
  ]);

  const metrics = [
    { label: '响应时间', value: 'response_time' },
    { label: '错误率', value: 'error_rate' },
    { label: 'CPU使用率', value: 'cpu_usage' },
    { label: '内存使用率', value: 'memory_usage' },
    { label: '调用量', value: 'request_count' },
  ];

  const conditions = [
    { label: '大于', value: '>' },
    { label: '小于', value: '<' },
    { label: '等于', value: '=' },
    { label: '大于等于', value: '>=' },
    { label: '小于等于', value: '<=' },
  ];

  const handleSubmit = (values: any) => {
    const newRule: AlertRule = {
      key: Date.now().toString(),
      ...values,
      enabled: true,
    };
    setRules([...rules, newRule]);
    message.success('告警规则添加成功');
    form.resetFields();
  };

  const toggleRule = (key: string, enabled: boolean) => {
    setRules(rules.map(rule => 
      rule.key === key ? { ...rule, enabled } : rule
    ));
    message.success(`告警规则${enabled ? '启用' : '禁用'}成功`);
  };

  const deleteRule = (key: string) => {
    setRules(rules.filter(rule => rule.key !== key));
    message.success('告警规则删除成功');
  };

  const columns: ColumnsType<AlertRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '监控指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string) => metrics.find(m => m.value === metric)?.label,
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition: string) => conditions.find(c => c.value === condition)?.label,
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
    },
    {
      title: '持续时间(分钟)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => toggleRule(record.key, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: AlertRule) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能开发中')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteRule(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600, marginBottom: 24 }}
      >
        <Form.Item
          name="name"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="请输入规则名称" />
        </Form.Item>

        <Form.Item
          name="metric"
          label="监控指标"
          rules={[{ required: true, message: '请选择监控指标' }]}
        >
          <Select placeholder="请选择监控指标">
            {metrics.map(metric => (
              <Option key={metric.value} value={metric.value}>
                {metric.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="condition"
          label="告警条件"
          rules={[{ required: true, message: '请选择告警条件' }]}
        >
          <Select placeholder="请选择告警条件">
            {conditions.map(condition => (
              <Option key={condition.value} value={condition.value}>
                {condition.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="threshold"
          label="阈值"
          rules={[{ required: true, message: '请输入阈值' }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="duration"
          label="持续时间(分钟)"
          rules={[{ required: true, message: '请输入持续时间' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            添加规则
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={rules}
        pagination={false}
      />
    </div>
  );
};

export default AlertSettings; 