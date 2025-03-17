import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  Switch,
  InputNumber,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';

const { Option } = Select;

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

const AlertConfig: React.FC = () => {
  const [form] = Form.useForm();
  const { alertRules, updateAlertRule, deleteAlertRule, loading } = useModel('dashboard');
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const metricOptions = [
    { label: '响应时间', value: 'responseTime' },
    { label: '错误率', value: 'errorRate' },
    { label: '请求数', value: 'requestCount' },
    { label: 'CPU使用率', value: 'cpuUsage' },
    { label: '内存使用率', value: 'memoryUsage' },
  ];

  const conditionOptions = [
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '等于', value: 'eq' },
  ];

  const severityOptions = [
    { label: '信息', value: 'info' },
    { label: '警告', value: 'warning' },
    { label: '严重', value: 'critical' },
  ];

  const channelOptions = [
    { label: '邮件', value: 'email' },
    { label: '钉钉', value: 'dingtalk' },
    { label: '企业微信', value: 'wecom' },
    { label: 'Slack', value: 'slack' },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const rule: AlertRule = {
        id: editingRule?.id || Date.now().toString(),
        ...values,
        enabled: true,
      };
      await updateAlertRule(rule);
      message.success('保存成功');
      form.resetFields();
      setEditingRule(null);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleEdit = (record: AlertRule) => {
    setEditingRule(record);
    form.setFieldsValue(record);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlertRule(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggle = async (record: AlertRule) => {
    try {
      await updateAlertRule({
        ...record,
        enabled: !record.enabled,
      });
      message.success(`${record.enabled ? '禁用' : '启用'}成功`);
    } catch (error) {
      message.error(`${record.enabled ? '禁用' : '启用'}失败`);
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '监控指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string) => metricOptions.find(opt => opt.value === metric)?.label,
    },
    {
      title: '条件',
      key: 'condition',
      render: (_, record: AlertRule) => (
        <span>
          {conditionOptions.find(opt => opt.value === record.condition)?.label}
          {' '}
          {record.threshold}
        </span>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colorMap = {
          info: 'blue',
          warning: 'orange',
          critical: 'red',
        };
        return (
          <Tag color={colorMap[severity as keyof typeof colorMap]}>
            {severityOptions.find(opt => opt.value === severity)?.label}
          </Tag>
        );
      },
    },
    {
      title: '通知方式',
      dataIndex: 'notificationChannels',
      key: 'notificationChannels',
      render: (channels: string[]) => (
        <Space>
          {channels.map(channel => (
            <Tag key={channel}>
              {channelOptions.find(opt => opt.value === channel)?.label}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggle(record)}
          loading={loading}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AlertRule) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条规则吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="告警规则配置">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ notificationChannels: ['email'] }}
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
            {metricOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space align="baseline" style={{ marginBottom: 24 }}>
          <Form.Item
            name="condition"
            label="条件"
            rules={[{ required: true, message: '请选择条件' }]}
          >
            <Select style={{ width: 120 }}>
              {conditionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="threshold"
            label="阈值"
            rules={[{ required: true, message: '请输入阈值' }]}
          >
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
        </Space>

        <Form.Item
          name="severity"
          label="严重程度"
          rules={[{ required: true, message: '请选择严重程度' }]}
        >
          <Select placeholder="请选择严重程度">
            {severityOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="notificationChannels"
          label="通知方式"
          rules={[{ required: true, message: '请选择至少一种通知方式' }]}
        >
          <Select mode="multiple" placeholder="请选择通知方式">
            {channelOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRule ? '更新规则' : '添加规则'}
            </Button>
            {editingRule && (
              <Button onClick={() => {
                setEditingRule(null);
                form.resetFields();
              }}>
                取消编辑
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={alertRules}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default AlertConfig; 