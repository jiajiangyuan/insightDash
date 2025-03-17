export interface ModelMetric {
  timestamp: string;
  value: number;
  model: string;
  metric: string;
}

export interface ModelComparison {
  model: string;
  accuracy: number;
  latency: number;
  costPerToken: number;
  reliability: number;
  satisfaction: number;
}

export interface ModelAnalysisData {
  metrics: ModelMetric[];
  comparisons: ModelComparison[];
  bestPerformer: string;
  averageLatency: number;
  averageAccuracy: number;
} 