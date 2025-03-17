import React from 'react';
import { Card, Table, Tag, Empty, Space, Button, Tooltip } from 'antd';
import dayjs from 'dayjs';
import ExportToolbar from '@/components/ExportToolbar';
import { useModel } from '@umijs/max';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { ColumnsType } from 'antd/es/table';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export interface AlertHistoryItem {
  id: string;
  timestamp: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  condition: string;
  severity: 'warning' | 'critical';
  status: 'active' | 'resolved';
  resolvedAt?: string;
  notificationsSent: number;
}

const AlertHistory: React.FC = () => {
  const { alertHistory, alertLoading: loading, resolveAlert } = useModel('dashboard');

  const columns: ColumnsType<AlertHistoryItem> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm:ss'),
    },
    {
      title: '规则',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: 'warning' | 'critical') => (
        <Tag color={severity === 'warning' ? 'warning' : 'error'}>
          {severity === 'warning' ? '警告' : '严重'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: AlertHistoryItem) => (
        <Space>
          <Tag
            color={status === 'active' ? 'processing' : 'success'}
            icon={status === 'active' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
          >
            {status === 'active' ? '活跃' : '已解决'}
          </Tag>
          {record.resolvedAt && (
            <Tooltip title={`解决时间: ${dayjs(record.resolvedAt).format('MM-DD HH:mm:ss')}`}>
              <span>({dayjs(record.resolvedAt).fromNow()})</span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AlertHistoryItem) => (
        <Space size="middle">
          {record.status === 'active' && (
            <Button type="link" onClick={() => resolveAlert(record.id)}>
              标记为已解决
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="告警历史"
      extra={
        <ExportToolbar
          data={(alertHistory || []).map(item => ({
            timestamp: item.timestamp,
            ruleName: item.ruleName,
            metric: item.metric,
            value: item.value,
            threshold: item.threshold,
            severity: item.severity === 'critical' ? '严重' : '警告',
            status: item.status === 'resolved' ? '已解决' : '未解决',
            resolvedAt: item.resolvedAt || '-',
            notificationsSent: item.notificationsSent,
          }))}
          filename={`告警历史_${dayjs().format('YYYY-MM-DD_HH-mm')}`}
        />
      }
    >
      {alertHistory.length > 0 ? (
        <Table
          columns={columns}
          dataSource={alertHistory}
          loading={loading}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      ) : (
        <Empty description="暂无告警记录" />
      )}
    </Card>
  );
};

export default AlertHistory; 