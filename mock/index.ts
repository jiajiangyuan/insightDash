import modelPerformance from './modelPerformance';
import anomalyConfig from './anomalyConfig';
import anomalyData from './anomalyData';

export default {
  ...modelPerformance,
  ...anomalyConfig,
  ...anomalyData,
}; 