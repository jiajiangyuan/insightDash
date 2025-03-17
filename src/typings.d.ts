import type { TimeGranularity } from '@/models/dashboard';
import type { Dayjs } from 'dayjs';

declare global {
  interface DashboardModelState {
    timeRange: [Dayjs, Dayjs];
    setTimeRange: (range: [Dayjs, Dayjs]) => void;
    timeGranularity: TimeGranularity;
    setTimeGranularity: (granularity: TimeGranularity) => void;
    performanceData: any;
    modelData: any;
    costData: any;
    sessionData: any;
  }

  type Namespaces = {
    dashboard: DashboardModelState;
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY: number;
      styles?: {
        fontSize?: number;
      };
      headStyles?: {
        fillColor?: number[];
      };
    }) => void;
  }
}

export {}; 