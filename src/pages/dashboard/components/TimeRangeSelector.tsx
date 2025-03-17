import React, { useState } from 'react';

const TimeRangeSelector: React.FC = () => {
  const [loading, setLoading] = useState(false); // 添加 setLoading 的定义

  const handleTimeRangeChange = (timeRange: any) => {
    setLoading(true); // 使用 setLoading
    // 模拟异步操作
    setTimeout(() => {
      setLoading(false); // 使用 setLoading
    }, 1000);
  };

  return (
    <div>
      <button onClick={() => handleTimeRangeChange('lastHour')}>Last Hour</button>
      <button onClick={() => handleTimeRangeChange('lastDay')}>Last Day</button>
      <button onClick={() => handleTimeRangeChange('lastWeek')}>Last Week</button>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default TimeRangeSelector;