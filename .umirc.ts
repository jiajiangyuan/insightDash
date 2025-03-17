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
    title: 'Dify 性能分析仪表板',
  },
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '性能分析',
      path: '/dashboard',
      component: './dashboard',
    },
  ],
  npmClient: 'pnpm',
});

