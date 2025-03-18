import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout';
import WorkflowEditor from '../pages/workflow/editor';
import Workflow3DEditor from '../pages/iCraftEditor';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/workflow/editor" element={<WorkflowEditor />} />
          <Route path="/workflow/3d" element={<Workflow3DEditor />} />
          <Route path="/" element={<WorkflowEditor />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default Router; 