// KPI 모듈 라우트 정의
export default [
  {
    path: '/kpi',
    name: 'kpi',
    component: () => import('./views/KPIView.vue'),
    meta: {
      layout: 'DefaultLayout',
      requiresAuth: true
    }
  }
]

