import { useState, useCallback } from 'react';
import { WorkflowTemplate } from '../types';
import { useWorkflowStore } from './useWorkflowStore';

export const useWorkflowTemplates = () => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const { templates, addTemplate, removeTemplate, updateTemplate } = useWorkflowStore();

  const handleSaveTemplate = useCallback(
    (template: WorkflowTemplate) => {
      if (template.id) {
        updateTemplate(template.id, template);
      } else {
        addTemplate(template);
      }
      setIsTemplateModalVisible(false);
    },
    [addTemplate, updateTemplate]
  );

  const handleDeleteTemplate = useCallback(
    (id: string) => {
      removeTemplate(id);
    },
    [removeTemplate]
  );

  return {
    templates,
    isTemplateModalVisible,
    setIsTemplateModalVisible,
    handleSaveTemplate,
    handleDeleteTemplate,
  };
}; 