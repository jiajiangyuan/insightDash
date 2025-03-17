import React from 'react';
import { DatePicker, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TimeRangeSelectorProps {
  onTimeRangeChange: (startDate: Dayjs, endDate: Dayjs) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ onTimeRangeChange }) => {
  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onTimeRangeChange(dates[0], dates[1]);
    }
  };

  // 快捷选项
  const quickRanges = [
    { 
      label: '今天',
      value: () => [dayjs().startOf('day'), dayjs()] as [Dayjs, Dayjs],
    },
    {
      label: '最近一周',
      value: () => [dayjs().subtract(7, 'day'), dayjs()] as [Dayjs, Dayjs],
    },
    {
      label: '最近一月',
      value: () => [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs],
    },
    {
      label: '上个月',
      value: () => [
        dayjs().subtract(1, 'month').startOf('month'),
        dayjs().subtract(1, 'month').endOf('month'),
      ] as [Dayjs, Dayjs],
    },
  ];

  return (
    <div>
      <Space direction="vertical" size={12}>
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={handleDateChange}
          presets={quickRanges}
          style={{ width: 400 }}
        />
      </Space>
    </div>
  );
};

export default TimeRangeSelector;