// 时间粒度类型
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month';

// 通用的分页参数接口
export interface PaginationParams {
  current: number;
  pageSize: number;
}

// 通用的响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 通用的时间范围类型
export interface TimeRange {
  startTime: string;
  endTime: string;
}

// 通用的排序类型
export type SortOrder = 'ascend' | 'descend' | null;

// 通用的加载状态类型
export interface LoadingState {
  loading: boolean;
  error: string | null;
} 