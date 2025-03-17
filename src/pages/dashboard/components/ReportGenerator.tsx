import React, { useRef, useState } from 'react';
import { Button, Card, message, Space, DatePicker, Form, Select } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportPerformanceSection from './ReportPerformanceSection';
import ReportCostSection from './ReportCostSection';
import ReportModelSection from './ReportModelSection';
import ReportSessionSection from './ReportSessionSection';
import ReportAlertSection from './ReportAlertSection';
import ExportData from './ExportData';

const { RangePicker } = DatePicker;

interface ReportConfig {
  timeRange: [Dayjs, Dayjs];
  sections: string[];
}

const ReportGenerator: React.FC = () => {
  const [form] = Form.useForm();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const {
    performanceData,
    costData,
    modelData,
    sessionData,
    alertData,
    fetchPerformanceData,
    fetchCostData,
    fetchModelData,
    fetchSessionData,
    fetchAlertData,
  } = useModel('dashboard');

  // 加载报告数据
  const loadReportData = async (values: ReportConfig) => {
    const { timeRange } = values;
    message.loading('正在加载报告数据...', 0);
    try {
      await Promise.all([
        fetchPerformanceData(),
        fetchCostData(),
        fetchModelData(),
        fetchSessionData(),
        fetchAlertData(),
      ]);
      message.success('数据加载完成');
      return true;
    } catch (error) {
      message.error('数据加载失败');
      return false;
    } finally {
      message.destroy();
    }
  };

  // 生成PDF
  const generatePDF = async () => {
    try {
      const values = await form.validateFields();
      const success = await loadReportData(values);
      if (!success) return;

      message.loading('正在生成PDF报告...', 0);
      
      if (!reportRef.current) return;
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // 添加报告标题
      pdf.setFontSize(20);
      pdf.text('Dify 应用性能分析报告', pdfWidth / 2, 20, { align: 'center' });
      
      // 添加报告时间范围
      pdf.setFontSize(12);
      pdf.text(
        `报告时间范围: ${values.timeRange[0].format('YYYY-MM-DD')} 至 ${values.timeRange[1].format('YYYY-MM-DD')}`,
        pdfWidth / 2,
        28,
        { align: 'center' }
      );

      // 添加报告内容
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // 添加页脚
      const pageCount = (pdf as any)._getPageCount();
      pdf.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `第 ${i} 页 / 共 ${pageCount} 页`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: 'center' }
        );
      }

      // 下载PDF
      pdf.save(`Dify应用性能分析报告_${dayjs().format('YYYY-MM-DD')}.pdf`);
      message.success('PDF报告生成成功');
    } catch (error) {
      message.error('PDF报告生成失败');
    } finally {
      message.destroy();
    }
  };

  const sectionOptions = [
    { label: '性能指标', value: 'performance' },
    { label: '成本分析', value: 'cost' },
    { label: '模型对比', value: 'model' },
    { label: '会话分析', value: 'session' },
    { label: '告警历史', value: 'alert' },
  ];

  return (
    <Card title="生成分析报告">
      <Form form={form} layout="vertical">
        <Form.Item
          name="timeRange"
          label="报告时间范围"
          rules={[{ required: true, message: '请选择时间范围' }]}
          initialValue={[dayjs().subtract(7, 'day'), dayjs()]}
        >
          <RangePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>
        <Form.Item
          name="sections"
          label="报告内容"
          rules={[{ required: true, message: '请选择要包含的报告内容' }]}
          initialValue={['performance', 'cost', 'model', 'session', 'alert']}
        >
          <Select
            mode="multiple"
            options={sectionOptions}
            placeholder="请选择要包含的报告内容"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={generatePDF}
            >
              生成PDF报告
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              导出原始数据
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 报告预览区域 */}
      <div ref={reportRef} style={{ padding: '20px', background: '#fff' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Dify 应用性能分析报告
          </h1>
          <p style={{ textAlign: 'center', color: '#666' }}>
            生成时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}
          </p>
        </div>

        {/* 性能指标部分 */}
        {form.getFieldValue('sections')?.includes('performance') && (
          <Card title="性能指标分析" style={{ marginBottom: '20px' }}>
            <ReportPerformanceSection data={performanceData} />
          </Card>
        )}

        {/* 成本分析部分 */}
        {form.getFieldValue('sections')?.includes('cost') && (
          <Card title="成本分析" style={{ marginBottom: '20px' }}>
            <ReportCostSection data={costData} />
          </Card>
        )}

        {/* 模型对比部分 */}
        {form.getFieldValue('sections')?.includes('model') && (
          <Card title="模型性能对比" style={{ marginBottom: '20px' }}>
            <ReportModelSection data={modelData} />
          </Card>
        )}

        {/* 会话分析部分 */}
        {form.getFieldValue('sections')?.includes('session') && (
          <Card title="用户会话分析" style={{ marginBottom: '20px' }}>
            <ReportSessionSection data={sessionData} />
          </Card>
        )}

        {/* 告警历史部分 */}
        {form.getFieldValue('sections')?.includes('alert') && (
          <Card title="告警历史记录" style={{ marginBottom: '20px' }}>
            <ReportAlertSection data={alertData} />
          </Card>
        )}
      </div>

      <ExportData
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
      />
    </Card>
  );
};

export default ReportGenerator; 