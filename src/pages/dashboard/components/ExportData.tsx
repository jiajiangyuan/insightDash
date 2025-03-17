import React from 'react';
import { Modal, Form, Select, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

interface ExportDataProps {
  visible: boolean;
  onCancel: () => void;
}

const ExportData: React.FC<ExportDataProps> = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const {
    performanceData,
    costData,
    modelData,
    sessionData,
    alertData,
  } = useModel('dashboard');

  const dataTypeOptions = [
    { label: '性能指标数据', value: 'performance' },
    { label: '成本分析数据', value: 'cost' },
    { label: '模型性能数据', value: 'model' },
    { label: '会话分析数据', value: 'session' },
    { label: '告警历史数据', value: 'alert' },
  ];

  const formatDataForExport = (type: string) => {
    switch (type) {
      case 'performance':
        return {
          responseTime: performanceData.responseTime,
          requests: performanceData.requests,
          errors: performanceData.errors,
        };
      case 'cost':
        return {
          costTrend: costData.costTrend,
          costBreakdown: costData.costBreakdown,
          summary: {
            totalCost: costData.totalCost,
            averageDailyCost: costData.averageDailyCost,
            costGrowthRate: costData.costGrowthRate,
          },
        };
      case 'model':
        return {
          metrics: modelData.metrics,
          comparisons: modelData.comparisons,
          summary: {
            bestPerformer: modelData.bestPerformer,
            averageLatency: modelData.averageLatency,
            averageAccuracy: modelData.averageAccuracy,
          },
        };
      case 'session':
        return {
          sessionTrend: sessionData.sessionTrend,
          userTypes: sessionData.userTypes,
          summary: {
            totalSessions: sessionData.totalSessions,
            averageDuration: sessionData.averageDuration,
            completionRate: sessionData.completionRate,
            activeUsers: sessionData.activeUsers,
          },
        };
      case 'alert':
        return {
          alerts: alertData.alerts,
          alertTrend: alertData.alertTrend,
          alertSummary: alertData.alertSummary,
          summary: {
            totalAlerts: alertData.totalAlerts,
            activeAlerts: alertData.activeAlerts,
            avgResolutionTime: alertData.avgResolutionTime,
            criticalAlerts: alertData.criticalAlerts,
          },
        };
      default:
        return {};
    }
  };

  const exportToExcel = async () => {
    try {
      const values = await form.validateFields();
      const { dataTypes, format } = values;

      // 准备导出数据
      const exportData: Record<string, any> = {};
      dataTypes.forEach((type: string) => {
        exportData[type] = formatDataForExport(type);
      });

      if (format === 'xlsx') {
        // 创建工作簿
        const wb = XLSX.utils.book_new();

        // 为每种数据类型创建工作表
        dataTypes.forEach((type: string) => {
          const data = exportData[type];
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              const ws = XLSX.utils.json_to_sheet(value);
              XLSX.utils.book_append_sheet(wb, ws, `${type}_${key}`);
            } else if (typeof value === 'object') {
              const ws = XLSX.utils.json_to_sheet([value]);
              XLSX.utils.book_append_sheet(wb, ws, `${type}_${key}`);
            }
          });
        });

        // 导出Excel文件
        XLSX.writeFile(wb, `Dify性能分析数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      } else {
        // CSV格式导出
        dataTypes.forEach((type: string) => {
          const data = exportData[type];
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // 将数据转换为CSV格式
              const ws = XLSX.utils.json_to_sheet(value);
              const csv = XLSX.utils.sheet_to_csv(ws);
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${type}_${key}_${dayjs().format('YYYY-MM-DD')}.csv`;
              link.click();
            }
          });
        });
      }

      message.success('数据导出成功');
      onCancel();
    } catch (error) {
      message.error('数据导出失败');
    }
  };

  return (
    <Modal
      title="导出数据"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="dataTypes"
          label="选择要导出的数据"
          rules={[{ required: true, message: '请选择要导出的数据类型' }]}
        >
          <Select
            mode="multiple"
            options={dataTypeOptions}
            placeholder="请选择要导出的数据类型"
          />
        </Form.Item>
        <Form.Item
          name="format"
          label="导出格式"
          rules={[{ required: true, message: '请选择导出格式' }]}
          initialValue="xlsx"
        >
          <Select
            options={[
              { label: 'Excel (XLSX)', value: 'xlsx' },
              { label: 'CSV', value: 'csv' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
            >
              导出数据
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportData; 