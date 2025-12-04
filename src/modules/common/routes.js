// Common 모듈 라우트 정의
export default [
  {
    path: '/error',
    name: 'error',
    component: () => import('./views/ErrorView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./views/ErrorView.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

