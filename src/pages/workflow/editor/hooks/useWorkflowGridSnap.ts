import { XYPosition } from 'reactflow';

export const useWorkflowGridSnap = (gridSize: number) => {
  const snapToGrid = (position: XYPosition): XYPosition => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  };

  const getSnappedPosition = (position: XYPosition): XYPosition => {
    return snapToGrid(position);
  };

  return {
    snapToGrid,
    getSnappedPosition,
  };
}; 