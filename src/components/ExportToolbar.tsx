import React from 'react';
import { Space, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportToolbarProps {
  data: any[];
  filename: string;
  title?: string;
  columns?: { title: string; dataIndex: string }[];
}

const ExportToolbar: React.FC<ExportToolbarProps> = ({
  data,
  filename,
  title = '数据导出',
  columns,
}) => {
  // 导出CSV
  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  };

  // 导出Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // 导出PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // 如果提供了列定义，使用它们来生成表格
    if (columns) {
      const tableColumns = columns.map(col => col.title);
      const tableData = data.map(item =>
        columns.map(col => item[col.dataIndex]?.toString() || '')
      );

      doc.autoTable({
        head: [tableColumns],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    } else {
      // 否则使用所有数据字段
      const headers = Object.keys(data[0] || {});
      const tableData = data.map(item =>
        headers.map(header => item[header]?.toString() || '')
      );

      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save(`${filename}.pdf`);
  };

  const items: MenuProps['items'] = [
    {
      key: 'csv',
      label: '导出CSV',
      icon: <DownloadOutlined />,
      onClick: exportCSV,
    },
    {
      key: 'excel',
      label: '导出Excel',
      icon: <DownloadOutlined />,
      onClick: exportExcel,
    },
    {
      key: 'pdf',
      label: '导出PDF',
      icon: <DownloadOutlined />,
      onClick: exportPDF,
    },
  ];

  return (
    <Space>
      <Dropdown menu={{ items }} placement="bottomLeft">
        <Button type="primary" icon={<DownloadOutlined />}>
          导出数据
        </Button>
      </Dropdown>
    </Space>
  );
};

export default ExportToolbar; 