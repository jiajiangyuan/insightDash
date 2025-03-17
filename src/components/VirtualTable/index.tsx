import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import './index.less';

interface VirtualTableProps<T> extends TableProps<T> {
  height?: number;
}

function VirtualTable<T extends object = any>(props: VirtualTableProps<T>) {
  const {
    columns,
    scroll,
    height = 400,
    ...restProps
  } = props;

  return (
    <div className="virtual-table">
      <Table
        {...restProps}
        columns={columns}
        scroll={{ ...scroll, y: height }}
        virtual
        pagination={false}
      />
    </div>
  );
}

export default VirtualTable; 