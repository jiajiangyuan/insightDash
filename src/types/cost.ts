export interface CostData {
  timestamp: string;
  cost: number;
  type: string;
}

export interface CostBreakdown {
  type: string;
  cost: number;
}

export interface CostAnalysisData {
  costTrend: CostData[];
  costBreakdown: CostBreakdown[];
  totalCost: number;
  averageDailyCost: number;
  costGrowthRate: number;
} 