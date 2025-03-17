import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

interface CustomMenuProps extends MenuProps {
  items: MenuProps['items'];
}

const CustomMenu: React.FC<CustomMenuProps> = ({ items, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      {...props}
      items={items}
      onClick={handleClick}
      selectedKeys={[location.pathname]}
      mode="inline"
    />
  );
};

export default CustomMenu; 