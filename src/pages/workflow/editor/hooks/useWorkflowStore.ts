import { create } from 'zustand';
import { WorkflowTemplate } from '../types';

interface WorkflowStore {
  templates: WorkflowTemplate[];
  addTemplate: (template: WorkflowTemplate) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<WorkflowTemplate>) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  templates: [],
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
  updateTemplate: (id, template) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...template } : t
      ),
    })),
})); 