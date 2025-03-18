import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  mock: {
    include: ['src/mock/**/*.ts'],
  },
  layout: {
    title: 'Demo',
    menu: {
      custom: true,
      component: './components/CustomMenu',
    },
  },
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '应用性能分析仪表板',
      path: '/dashboard',
      component: './dashboard',
    },
    {
      path: '/workflow',
      name: '工作流',
      icon: 'ApiOutlined',
      routes: [
        {
          path: '/workflow/list',
          name: '工作流列表',
          component: './workflow/list',
        },
        {
          path: '/workflow/editor',
          name: '工作流编辑器',
          component: './workflow/editor',
        },
        {
          path: '/workflow/detail/:id',
          name: '工作流详情',
          component: './workflow/detail',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/iCraftEditor',
      name: 'iCraft Editor',
      component: './iCraftEditor',
    },
  ],
  npmClient: 'pnpm',
});

