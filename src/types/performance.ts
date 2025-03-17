export interface ResponseTimeData {
  timestamp: string;
  value: number;
  type: string;
}

export interface RequestData {
  timestamp: string;
  count: number;
  type: string;
}

export interface ErrorData {
  type: string;
  count: number;
}

export interface PerformanceData {
  responseTime: ResponseTimeData[];
  requests: RequestData[];
  errors: ErrorData[];
} 