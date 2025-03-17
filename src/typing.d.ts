import type { TimeGranularity } from '@/models/dashboard';
import type { Dayjs } from 'dayjs';

declare global {
  interface DashboardModelState {
    timeRange: [Dayjs, Dayjs];
    setTimeRange: (range: [Dayjs, Dayjs]) => void;
    timeGranularity: TimeGranularity;
    setTimeGranularity: (granularity: TimeGranularity) => void;
  }
}

type Namespaces = {
  dashboard: DashboardModelState;
}; 