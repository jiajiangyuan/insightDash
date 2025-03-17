import { Node, XYPosition } from 'reactflow';
import { WorkflowNode } from '../types';

interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

const defaultOptions: LayoutOptions = {
  nodeWidth: 200,
  nodeHeight: 100,
  horizontalSpacing: 100,
  verticalSpacing: 100,
};

export const useWorkflowAutoLayout = () => {
  const applyAutoLayout = (nodes: Node[], options: Partial<LayoutOptions> = {}): Node[] => {
    const layoutOptions = { ...defaultOptions, ...options };
    const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = layoutOptions;

    // 按类型对节点进行分组
    const nodeGroups = groupNodesByType(nodes);
    
    // 计算每个组的布局
    const layoutedNodes: Node[] = [];
    let currentY = 0;

    Object.entries(nodeGroups).forEach(([type, groupNodes]) => {
      // 计算当前组的布局
      const groupLayout = layoutNodeGroup(groupNodes, currentY, layoutOptions);
      layoutedNodes.push(...groupLayout);
      
      // 更新下一个组的起始Y坐标
      currentY += (groupNodes.length * (nodeHeight + verticalSpacing)) + verticalSpacing;
    });

    return layoutedNodes;
  };

  const groupNodesByType = (nodes: Node[]): Record<string, Node[]> => {
    return nodes.reduce((groups, node) => {
      const type = (node.data as any).type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
      return groups;
    }, {} as Record<string, Node[]>);
  };

  const layoutNodeGroup = (nodes: Node[], startY: number, options: LayoutOptions): Node[] => {
    const { nodeWidth, horizontalSpacing } = options;
    const totalWidth = nodes.length * (nodeWidth + horizontalSpacing) - horizontalSpacing;
    let currentX = -totalWidth / 2; // 居中布局

    return nodes.map(node => ({
      ...node,
      position: {
        x: currentX,
        y: startY,
      },
    }));
  };

  return {
    applyAutoLayout,
  };
}; 