import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { validateWorkflow, ValidationError } from '../utils/validation';

export const useWorkflowValidation = () => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // 验证工作流
  const validate = useCallback((nodes: Node[], edges: Edge[]) => {
    setIsValidating(true);
    try {
      const validationErrors = validateWorkflow(nodes, edges);
      setErrors(validationErrors);
      return validationErrors.length === 0;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // 清除验证错误
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 获取特定节点的错误
  const getNodeErrors = useCallback((nodeId: string) => {
    return errors.filter((error) => error.nodeId === nodeId);
  }, [errors]);

  // 获取特定边的错误
  const getEdgeErrors = useCallback((edgeId: string) => {
    return errors.filter((error) => error.edgeId === edgeId);
  }, [errors]);

  // 获取特定类型的错误
  const getErrorsByType = useCallback((type: ValidationError['type']) => {
    return errors.filter((error) => error.type === type);
  }, [errors]);

  return {
    errors,
    isValidating,
    validate,
    clearErrors,
    getNodeErrors,
    getEdgeErrors,
    getErrorsByType,
  };
}; 