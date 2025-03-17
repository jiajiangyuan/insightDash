import React, { useCallback } from 'react';
import { BaseEdge, EdgeProps, getStraightPath, getBezierPath, getSmoothStepPath } from 'reactflow';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    label?: string;
    color?: string;
    width?: number;
    animated?: boolean;
    style?: 'default' | 'straight' | 'step' | 'smoothstep' | 'curve' | 'custom';
    controlPoints?: { x: number; y: number }[];
  };
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const edgeStyle = {
    stroke: data?.color || '#b1b1b7',
    strokeWidth: data?.width || 2,
    ...style,
  };

  const getPath = useCallback(() => {
    switch (data?.style) {
      case 'straight':
        return getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        });
      case 'step':
        return getSmoothStepPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          borderRadius: 20,
        });
      case 'smoothstep':
        return getSmoothStepPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          borderRadius: 20,
        });
      case 'curve':
        return getBezierPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          curvature: 0.5,
        });
      case 'custom':
        if (data?.controlPoints && data.controlPoints.length > 0) {
          // 自定义路径生成逻辑
          const points = [
            `M ${sourceX} ${sourceY}`,
            ...data.controlPoints.map(point => `L ${point.x} ${point.y}`),
            `L ${targetX} ${targetY}`,
          ].join(' ');
          return [points, 0, 0];
        }
        return getBezierPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          curvature: 0.5,
        });
      default:
        return getBezierPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          curvature: 0.5,
        });
    }
  }, [sourceX, sourceY, targetX, targetY, data?.style, data?.controlPoints]);

  const [edgePath, labelX, labelY] = getPath();

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        className={`${data?.animated ? 'edge-animated' : ''} ${data?.style || 'default'}`}
      />
      {data?.label && (
        <text
          x={labelX}
          y={labelY}
          className="edge-label"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: data.color || '#b1b1b7',
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'all',
            userSelect: 'none',
          }}
        >
          {data.label}
        </text>
      )}
    </>
  );
};

export default CustomEdge; 