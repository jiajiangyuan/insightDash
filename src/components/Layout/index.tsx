import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  CubeOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/workflow/editor',
      icon: <AppstoreOutlined />,
      label: '2D工作流',
    },
    {
      key: '/workflow/3d',
      icon: <CubeOutlined />,
      label: '3D工作流',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: '#fff' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderBottom: '1px solid #f0f0f0' }}
        />
      </Header>
      <Content>{children}</Content>
    </Layout>
  );
};

export default MainLayout; 